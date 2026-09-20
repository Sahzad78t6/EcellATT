import { z } from 'zod';

export const createVerticalSchema = {
  body: z.object({
    name: z.string().min(2, 'Vertical name must be at least 2 characters'),
    description: z.string().optional().default(''),
    secretary: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').nullable().optional(),
    leads: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).optional().default([])
  })
};

export const updateVerticalSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vertical ID')
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    secretary: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').nullable().optional(),
    leads: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).optional(),
    isActive: z.boolean().optional()
  })
};
