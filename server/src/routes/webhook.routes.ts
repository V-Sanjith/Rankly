import { Router } from 'express';
import { verifyWebhook, handleWebhookEvent } from '../services/payment.service.js';
import express from 'express';

const router = Router();

router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    
    if (!verifyWebhook(req.body, signature)) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(req.body);
    await handleWebhookEvent(event);
    
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

export default router;
