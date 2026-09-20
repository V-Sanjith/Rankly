import { Router } from 'express';
import { create, list, getBySlug, getMyProjects, update, initiatePromotion, verifyPromotion } from '../services/project.service.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { createProjectSchema, updateProjectSchema, initiatePromotionSchema, verifyPromotionSchema } from '../validators/project.validator.js';

const router = Router();

router.post('/promote', validate(initiatePromotionSchema), async (req, res, next) => {
  try {
    const orderData = await initiatePromotion(req.body);
    res.status(201).json({ success: true, data: orderData });
  } catch (error) {
    next(error);
  }
});

router.post('/promote/verify', validate(verifyPromotionSchema), async (req, res, next) => {
  try {
    const result = await verifyPromotion(req.body);
    res.json({ success: true, message: 'Promotion confirmed!', data: result });
  } catch (error) {
    next(error);
  }
});


router.get('/', async (req, res, next) => {
  try {
    const { category, page, limit } = req.query;
    const projects = await list({
      category: category as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });
    res.json({ success: true, ...projects });
  } catch (error) {
    next(error);
  }
});

router.get('/my/projects', authenticate, async (req, res, next) => {
  try {
    const projects = await getMyProjects(req.user!.id);
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const project = await getBySlug(req.params.slug);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, validate(createProjectSchema), async (req, res, next) => {
  try {
    const project = await create(req.user!.id, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, validate(updateProjectSchema), async (req, res, next) => {
  try {
    const project = await update(req.user!.id, req.params.id as string, req.body);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

export default router;
