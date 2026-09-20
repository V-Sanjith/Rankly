import { z } from 'zod';
import { Category, ProjectStatus } from '../types/index.js';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    url: z.string().url().max(500),
    shortDescription: z.string().min(10).max(200),
    description: z.string().min(50).max(5000),
    category: z.nativeEnum(Category),
    imageUrl: z.string().url().optional().nullable(),
    founderName: z.string().max(100).optional().nullable(),
    contactEmail: z.string().email().optional().nullable(),
    socialLinks: z.record(z.string(), z.string().url()).optional().nullable()
  })
});

export const updateProjectSchema = z.object({
  body: createProjectSchema.shape.body.partial()
});

export const projectStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ProjectStatus)
  })
});

const DOMAIN_REGEX = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/;

export const initiatePromotionSchema = z.object({
  body: z.object({
    url: z.string().regex(DOMAIN_REGEX, 'Please enter a valid website domain with an extension (e.g., example.com, https://myproject.io)'),
    category: z.string(),
    amount: z.number().min(199, 'Minimum bid amount is ₹199'),
    name: z.string().optional(),
    contactEmail: z.string().email().optional().or(z.literal('')),
  })
});

export const verifyPromotionSchema = z.object({
  body: z.object({
    bidId: z.string(),
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string()
  })
});
