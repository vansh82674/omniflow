import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateApiRequest } from '@/lib/api-auth';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateApiRequest(request);
    if (!authResult?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.userId;

    const { id } = await params;

    const job = await prisma.job.findFirst({
      where: {
        id,
        userId, // users can only access their own jobs
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: job.id,
      name: job.filename,
      status: job.status,
      result: job.result,
      failedReason: job.failedReason,
      fileType: job.fileType,
      timestamp: job.createdAt,
    });
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
