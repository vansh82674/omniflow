import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';
import { checkRateLimit } from '@/lib/rate-limit';

const documentQueue = new Queue('document-extraction', { connection: redis });

export async function POST(request: Request) {
  try {
    // Basic Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    // Max 5 uploads per 60 seconds per IP
    const isAllowed = await checkRateLimit(ip, 5, 60);
    
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const data = await request.formData();
    const fileOrText = data.get('content') as string | File;

    if (!fileOrText) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    let contentToProcess = '';
    if (fileOrText instanceof File) {
      contentToProcess = await fileOrText.text();
    } else {
      contentToProcess = fileOrText;
    }

    const job = await documentQueue.add('extract', { content: contentToProcess });

    return NextResponse.json({ jobId: job.id, message: 'Job added successfully' }, { status: 202 });
  } catch (error) {
    console.error('Error adding job to queue:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
