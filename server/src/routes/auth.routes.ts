import { Router } from 'express';
import { register, login, refreshTokens, getProfile, updateProfile, changePassword } from '../services/auth.service.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await login(req.body.email, req.body.password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshTokens(refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const profile = await getProfile(req.user!.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

router.put('/me', authenticate, async (req, res, next) => {
  try {
    const profile = await updateProfile(req.user!.id, req.body);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

router.put('/me/password', authenticate, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await changePassword(req.user!.id, oldPassword, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
