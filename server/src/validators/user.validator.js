import { z } from 'zod';
import { ROLES } from '../config/constants.js';

export const createUserSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    memberId: z.string().min(2, 'Member ID is required'),
    role: z.enum(Object.values(ROLES)).default(ROLES.MEMBER),
    vertical: z.string().nullable().optional(),
    phone: z.string().optional(),
    year: z.string().optional(),
    branch: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    sendEmailCredentials: z.boolean().optional().default(false)
  })
};

export const updateUserSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    memberId: z.string().min(2).optional(),
    role: z.enum(Object.values(ROLES)).optional(),
    vertical: z.string().nullable().optional(),
    phone: z.string().optional(),
    year: z.string().optional(),
    branch: z.string().optional(),
    isActive: z.boolean().optional()
  })
};

export const resetPasswordSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')
  }),
  body: z.object({
    password: z.string().min(8).optional(),
    sendEmailCredentials: z.boolean().optional().default(false)
  })
};

export const listUsersSchema = {
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    search: z.string().optional(),
    role: z.string().optional(),
    vertical: z.string().optional(),
    isActive: z.string().optional(),
    sortBy: z.string().optional().default('name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
  })
};
