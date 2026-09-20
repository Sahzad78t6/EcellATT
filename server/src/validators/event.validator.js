import { z } from 'zod';
import { EVENT_TYPES } from '../config/constants.js';

export const createEventSchema = {
  body: z
    .object({
      name: z.string().min(2, 'Event name must be at least 2 characters'),
      description: z.string().optional().default(''),
      type: z.enum(EVENT_TYPES).default('Event'),
      date: z.string().min(1, 'Date is required'),
      startTime: z.string().min(1, 'Start time is required'),
      endTime: z.string().min(1, 'End time is required'),
      venue: z.string().optional().default('E-Cell Hall / Virtual'),
      targetVerticals: z
        .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vertical ID'))
        .optional()
        .default([]),
      session: z.string().min(1, 'Academic session is required')
    })
    .refine(
      (data) => new Date(data.endTime) > new Date(data.startTime),
      {
        message: 'End time must be after start time',
        path: ['endTime']
      }
    )
};

export const updateEventSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID')
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    type: z.enum(EVENT_TYPES).optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    venue: z.string().optional(),
    targetVerticals: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vertical ID'))
      .optional(),
    session: z.string().optional()
  })
};

export const listEventsSchema = {
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    status: z.string().optional(),
    vertical: z.string().optional(),
    session: z.string().optional(),
    type: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional().default('startTime'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  })
};
