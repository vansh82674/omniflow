import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';
import { checkRateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { authenticateApiRequest } from '@/lib/api-auth';

const documentQueue = new Queue('document-extraction', { connection: redis });

// Supported file types
const SUPPORTED_TYPES: Record<string, string> = {
  'text/plain': 'txt',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'text/markdown': 'md',
  'text/csv': 'csv',
};

const MAX_FILE_SIZE_MB = 10;

async function extractTextFromFile(file: File): Promise<string> {
  const mimeType = file.type;

  // Plain text, markdown, CSV
  if (['text/plain', 'text/markdown', 'text/csv'].includes(mimeType) || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
    return await file.text();
  }

  // PDF
  if (mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Polyfill globals for pdf-parse/pdf.js in Node.js
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (typeof (global as any).DOMMatrix === 'undefined') {
      (global as any).DOMMatrix = class DOMMatrix {};
    }
    if (typeof (global as any).Path2D === 'undefined') {
      (global as any).Path2D = class Path2D {};
    }
    if (typeof (global as any).ImageData === 'undefined') {
      (global as any).ImageData = class ImageData {};
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // pdf-parse CommonJS import
    // pdf-parse v2 API
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const parsed = await parser.getText();
    return parsed.text;
  }

  // DOCX
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Fallback: attempt plain text
  return await file.text();
}

export async function POST(request: Request) {
  try {
    // Auth guard — must be logged in via session or API Key
    const authResult = await authenticateApiRequest(request);
    if (!authResult?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.userId;

    // Rate limiting per user ID (not just IP)
    const rateLimitKey = userId;
    const isAllowed = await checkRateLimit(rateLimitKey, 10, 60); // 10 uploads/min per user
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.credits < 10) {
      return NextResponse.json({ error: 'Insufficient credits (10 required).' }, { status: 402 });
    }

    const data = await request.formData();
    const file = data.get('content') as File | string | null;
    const webhookUrl = data.get('webhookUrl') as string | null;
    const extractionSchema = data.get('extractionSchema') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    let contentToProcess = '';
    let filename = 'text-input';
    let fileType = 'txt';

    if (file instanceof File) {
      // File size check
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_FILE_SIZE_MB) {
        return NextResponse.json(
          { error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` },
          { status: 400 }
        );
      }

      filename = file.name;
      fileType = SUPPORTED_TYPES[file.type] || file.name.split('.').pop() || 'unknown';

      // Extract text based on file type
      contentToProcess = await extractTextFromFile(file);

      if (!contentToProcess.trim()) {
        return NextResponse.json(
          { error: 'Could not extract text from this file. Please ensure it is not a scanned image-only PDF.' },
          { status: 422 }
        );
      }
    } else {
      contentToProcess = file;
      filename = 'text-input';
      fileType = 'txt';
    }

    // Generate a single ID to use for both Prisma and BullMQ
    const jobId = crypto.randomUUID();

    // 1. Create a Job record in DB first
    const dbJob = await prisma.job.create({
      data: {
        id: jobId,
        bullmqId: jobId,
        userId,
        filename,
        fileType,
        webhookUrl: webhookUrl ? webhookUrl.trim() : null,
        extractionSchema: extractionSchema ? extractionSchema.trim() : null,
        status: 'created', // Non-terminal enqueue-pending state
      },
    });

    // Deduct 10 credits
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 10 } } as any,
    });

    try {
      // 2. Add to BullMQ queue using the exact same ID
      await documentQueue.add(
        'extract',
        { 
          content: contentToProcess, 
          filename, 
          dbJobId: jobId,
          webhookUrl: webhookUrl ? webhookUrl.trim() : null,
          extractionSchema: extractionSchema ? extractionSchema.trim() : null
        },
        {
          jobId, // Explicitly set the BullMQ job ID to match Prisma
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 60000,
          },
        }
      );
    } catch (queueError) {
      // Do not mark the job as failed here. If Redis accepted the job but the network connection dropped,
      // the worker will still process it and update the state to completed. Overwriting it to 'failed' here
      // would create a race condition. It remains in the 'created' enqueue-pending state for reconciliation.
      console.error('Failed to enqueue to BullMQ:', queueError);
      return NextResponse.json(
        { error: 'Queue service timeout. Job may still process.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { jobId: dbJob.id, bullmqId: dbJob.bullmqId, message: 'Job added successfully' },
      { status: 202 }
    );
  } catch (error) {
    console.error('Error processing upload request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
