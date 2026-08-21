import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const [totalJobs, completedJobs, failedJobs, recentJobs, userRecord] = await Promise.all([
      prisma.job.count({ where: { userId } }),
      prisma.job.count({ where: { userId, status: 'completed' } }),
      prisma.job.count({ where: { userId, status: 'failed' } }),
      // Jobs in last 24h
      prisma.job.count({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      // @ts-expect-error Prisma types might not be fully synced in IDE
      prisma.user.findUnique({ where: { id: userId }, select: { credits: true } })
    ]);

    const successRate =
      totalJobs > 0
        ? ((completedJobs / totalJobs) * 100).toFixed(1)
        : '0.0';

    return NextResponse.json({
      totalJobs,
      completedJobs,
      failedJobs,
      recentJobs,
      successRate: `${successRate}%`,
      // @ts-expect-error Prisma types might not be fully synced in IDE
      credits: userRecord?.credits ?? 0,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
