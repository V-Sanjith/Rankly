import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, verifySignature, verifyWebhook } from '../../src/services/payment.service.js';

// We will test behavior with empty Razorpay keys (mock mode)
vi.mock('../../src/config/env.js', () => ({
  env: {
    RAZORPAY_KEY_ID: '',
    RAZORPAY_KEY_SECRET: '',
    RAZORPAY_WEBHOOK_SECRET: 'webhook_secret_test'
  }
}));

describe('Payment Service (Mock Mode)', () => {
  it('returns valid mock orders when RAZORPAY_KEY_ID is empty', async () => {
    const order = await createOrder(500, 'INR', 'receipt_123');
    
    expect(order).toBeDefined();
    expect(order.id).toMatch(/^mock_order_/);
    expect(order.amount).toBe(50000); // 500 * 100 paise
    expect(order.currency).toBe('INR');
    expect(order.status).toBe('created');
  });

  it('mock signature verification accepts mock orders', () => {
    const isValid = verifySignature('mock_order_123', 'pay_123', 'some_signature');
    expect(isValid).toBe(true);
  });
  
  it('webhook signature verification accepts anything in mock mode (when razorpay object is null)', () => {
    const isValid = verifyWebhook('raw_body_content', 'invalid_signature');
    expect(isValid).toBe(true);
  });
});
