import { NextResponse } from 'next/server';
import { authenticateApiRequest } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const auth = await authenticateApiRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = auth;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    });

    // Create an order for ₹800 INR (approx $10 for 1000 credits)
    // Amount is in the smallest currency unit (paise), so 800 * 100 = 80000
    const order = await razorpay.orders.create({
      amount: 80000,
      currency: "INR",
      receipt: `rcpt_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
      }
    });

    // We can store the order ID to track it
    await prisma.user.update({
      where: { id: userId },
      data: { razorpayOrderId: order.id } as any,
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment order.' }, { status: 500 });
  }
}
