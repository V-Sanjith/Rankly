import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
  })
});
