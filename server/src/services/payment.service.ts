import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';

let razorpay: Razorpay | null = null;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

export const createOrder = async (amount: number, currency: string, receipt: string) => {
  if (!razorpay) {
    // Mock mode
    return {
      id: `mock_order_${crypto.randomBytes(8).toString('hex')}`,
      amount: amount * 100,
      currency,
      receipt,
      status: 'created'
    };
  }

  return razorpay.orders.create({
    amount: amount * 100, // Razorpay takes amount in paise
    currency,
    receipt,
  });
};

export const verifySignature = (orderId: string, paymentId: string, signature: string) => {
  if (!razorpay) {
    // Mock mode: accept if it looks like our mock IDs
    return orderId.startsWith('mock_order_') || orderId === 'mock';
  }

  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  return generatedSignature === signature;
};

export const verifyWebhook = (rawBody: string, signature: string) => {
  if (!razorpay) return true;

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
    
  return expectedSignature === signature;
};

export const handleWebhookEvent = async (event: any) => {
  const { event: eventType, payload } = event;
  
  if (eventType === 'payment.captured') {
    const paymentEntity = payload.payment.entity;
    await prisma.payment.updateMany({
      where: { providerOrderId: paymentEntity.order_id },
      data: { status: 'PAID' }
    });
  } else if (eventType === 'payment.failed') {
    const paymentEntity = payload.payment.entity;
    await prisma.payment.updateMany({
      where: { providerOrderId: paymentEntity.order_id },
      data: { status: 'FAILED' }
    });
  }
};

export const getPaymentStatus = async (paymentId: string) => {
  return prisma.payment.findUnique({ where: { id: paymentId } });
};
