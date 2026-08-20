import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';
import { checkRateLimit } from '@/lib/rate-limit';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

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
    if (typeof (global as any).DOMMatrix === 'undefined') {
      (global as any).DOMMatrix = class DOMMatrix {};
    }
    if (typeof (global as any).Path2D === 'undefined') {
      (global as any).Path2D = class Path2D {};
    }
    if (typeof (global as any).ImageData === 'undefined') {
      (global as any).ImageData = class ImageData {};
    }

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
    // Auth guard — must be logged in
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting per user ID (not just IP)
    const rateLimitKey = session.user.id;
    const isAllowed = await checkRateLimit(rateLimitKey, 10, 60); // 10 uploads/min per user
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const data = await request.formData();
    const file = data.get('content') as File | string | null;

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

    // Create a Job record in DB first (so we can track it)
    const dbJob = await prisma.job.create({
      data: {
        userId: session.user.id,
        filename,
        fileType,
        status: 'waiting',
      },
    });

    // Add to BullMQ queue, storing filename + dbJobId in payload
    const bullJob = await documentQueue.add(
      'extract',
      { content: contentToProcess, filename, dbJobId: dbJob.id },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 60000,
        },
      }
    );

    // Store the BullMQ ID back into the DB record
    await prisma.job.update({
      where: { id: dbJob.id },
      data: { bullmqId: bullJob.id },
    });

    return NextResponse.json(
      { jobId: dbJob.id, bullmqId: bullJob.id, message: 'Job added successfully' },
      { status: 202 }
    );
  } catch (error) {
    console.error('Error adding job to queue:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
