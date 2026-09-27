import { z } from 'zod';

// Matches backend/src/auth/dto/register.dto.ts's BD_PHONE_PATTERN.
const BD_PHONE_PATTERN = /^(?:\+?880|0)1[3-9]\d{8}$/;

const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Enter your email or phone number.')
  .refine(
    (value) =>
      value.includes('@')
        ? z.string().email().safeParse(value).success
        : BD_PHONE_PATTERN.test(value),
    'Enter a valid email or Bangladeshi phone number.',
  );

// Login is intentionally more lenient than register (matches login.dto.ts,
// which only enforces maxLength on phone/password) - this is a lookup, not a
// new account, so over-validating here would just block real accounts whose
// data predates a rule.
export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, 'Enter your password.'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(80, 'Name is too long.'),
  identifier: identifierSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password is too long.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
