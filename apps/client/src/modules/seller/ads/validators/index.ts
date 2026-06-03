import { z } from 'zod';

export const createAdSchema = z.object({
  title: z.string().min(3, 'At least 3 characters').max(100),
  description: z.string().min(10, 'At least 10 characters').max(2000),
  price: z.number({ invalid_type_error: 'Price is required' }).positive('Price must be positive'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
  city: z.string().min(2, 'City is required'),
  area: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
});

export type CreateAdFormValues = z.infer<typeof createAdSchema>;
