import * as z from 'zod';

export const Schemas = {
  login: z.object({
    email: z.string().email('Invalid email address'),
    password_hash: z.string().min(6, 'Password must be at least 6 characters'),
  }),
};
