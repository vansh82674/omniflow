import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    if (!signature) {
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Razorpay events
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload.payment?.entity;
      const order = event.payload.order?.entity;
      
      const userId = payment?.notes?.userId || order?.notes?.userId;
      const creditsToAdd = 1000;

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            credits: { increment: creditsToAdd },
          } as any,
        });
        console.log(`[Razorpay Webhook] Added ${creditsToAdd} credits to user ${userId}`);
      } else {
        console.warn(`[Razorpay Webhook] Payment captured but no userId found in notes.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Razorpay Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }
}
