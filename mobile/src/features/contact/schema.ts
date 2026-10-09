import { z } from 'zod';

// Mirrors web's sendContactMessageAction checks (name 2+, email or phone,
// message 10-2000 characters).
export const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Please enter your name.')
      .max(80, 'Name is too long.'),
    topic: z.enum([
      'general',
      'listing',
      'advertising',
      'account',
      'report',
      'other',
    ]),
    email: z
      .string()
      .trim()
      .max(120, 'Email is too long.')
      .refine(
        (value) => value === '' || z.string().email().safeParse(value).success,
        'Enter a valid email address.',
      ),
    phone: z.string().trim().max(20, 'Phone number is too long.'),
    message: z
      .string()
      .trim()
      .min(10, 'Please write a little more so we can help (10+ characters).')
      .max(2000, 'Message is too long (2000 characters max).'),
  })
  .refine((values) => values.email !== '' || values.phone !== '', {
    message: 'Add an email or phone number so we can reply.',
    path: ['email'],
  });

export type ContactFormValues = z.infer<typeof contactSchema>;
