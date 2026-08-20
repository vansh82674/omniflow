import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';

const documentQueue = new Queue('document-extraction', { connection: redis });

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const job = await documentQueue.getJob(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const state = await job.getState();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return NextResponse.json({
      id: job.id,
      name: job.data.content ? "Document Upload" : "Unknown",
      status: state, // 'completed', 'failed', 'active', 'waiting', 'delayed'
      result,
      failedReason,
      timestamp: job.timestamp
    });
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
