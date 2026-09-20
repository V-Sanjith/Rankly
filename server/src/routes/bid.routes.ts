import { Router } from 'express';
import { create, confirmBid, getMyBids } from '../services/bid.service.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { createBidSchema, verifyPaymentSchema } from '../validators/bid.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createBidSchema), async (req, res, next) => {
  try {
    const { projectId, amount } = req.body;
    const result = await create(req.user!.id, projectId, amount);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/verify', validate(verifyPaymentSchema), async (req, res, next) => {
  try {
    const { bidId } = req.body;
    const bid = await confirmBid(bidId, req.body);
    res.json({ success: true, data: bid });
  } catch (error) {
    next(error);
  }
});

router.get('/my', async (req, res, next) => {
  try {
    const bids = await getMyBids(req.user!.id);
    res.json({ success: true, data: bids });
  } catch (error) {
    next(error);
  }
});

export default router;
