import { z } from 'zod';

export const loginSchema = {
  body: z.object({
    identifier: z.string().min(1, 'Email or Member ID is required'),
    password: z.string().min(1, 'Password is required')
  })
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one digit')
  })
};
