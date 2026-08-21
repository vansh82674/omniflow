import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const stream = new ReadableStream({
    async start(controller) {
      // Send an initial connected message
      controller.enqueue('event: connected\ndata: true\n\n');

      // Simple polling fallback on the server-side to check Prisma DB for updates
      // In a truly massive enterprise system, we would subscribe to a Redis pub/sub channel here
      const intervalId = setInterval(async () => {
        try {
          const jobs = await prisma.job.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20, // Stream the latest 20 jobs
          });
          
          controller.enqueue(`data: ${JSON.stringify(jobs)}\n\n`);
        } catch (error) {
          console.error('[SSE] Error fetching jobs', error);
          controller.enqueue('event: error\ndata: Database query failed\n\n');
        }
      }, 3000);

      // Cleanup when the client disconnects
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
