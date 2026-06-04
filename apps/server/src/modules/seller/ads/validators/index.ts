import { z } from 'zod';

export const createAdSchema = z.object({
  title: z.string().min(3, 'At least 3 characters').max(100),
  description: z.string().min(10, 'At least 10 characters').max(2000),
  price: z.number().positive('Price must be positive'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
  city: z.string().min(2),
  area: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
});

export const updateAdSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  price: z.number().positive().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']).optional(),
  city: z.string().min(2).optional(),
  area: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
});

export const changeStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'SOLD']),
});
