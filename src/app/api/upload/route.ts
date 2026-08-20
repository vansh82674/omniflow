import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';

const documentQueue = new Queue('document-extraction', { connection: redis });

export async function POST(request: Request) {
  try {
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
