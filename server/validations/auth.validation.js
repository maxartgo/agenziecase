// server/validations/auth.validation.js
import { z } from 'zod'

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'La password deve essere di almeno 8 caratteri')
  .regex(/[A-Z]/, 'La password deve contenere almeno una maiuscola')
  .regex(/[a-z]/, 'La password deve contenere almeno una minuscola')
  .regex(/[0-9]/, 'La password deve contenere almeno un numero')
  .regex(
    /[^A-Za-z0-9]/,
    'La password deve contenere almeno un carattere speciale'
  )

// Registration validation schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Il nome deve essere di almeno 2 caratteri')
    .max(100, 'Il nome non può superare i 100 caratteri'),
  email: z
    .string()
    .email('Email non valida')
    .toLowerCase()
    .trim(),
  password: passwordSchema,
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-()]+$/, 'Numero di telefono non valido')
    .optional(),
  role: z
    .enum(['user', 'agent', 'partner', 'admin'], {
      errorMap: () => ({ message: 'Ruolo non valido' })
    })
    .optional()
    .default('user')
})

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email non valida')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'La password è obbligatoria')
})

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'La password attuale è obbligatoria'),
  newPassword: passwordSchema,
  confirmPassword: z
    .string()
    .min(1, 'Conferma la nuova password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Le password non coincidono',
  path: ['confirmPassword']
})

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Email non valida')
    .toLowerCase()
    .trim()
})

// Reset password validation schema
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Token mancante'),
  newPassword: passwordSchema
})

// Update profile validation schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Il nome deve essere di almeno 2 caratteri')
    .max(100, 'Il nome non può superare i 100 caratteri')
    .optional(),
  email: z
    .string()
    .email('Email non valida')
    .toLowerCase()
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-()]+$/, 'Numero di telefono non valido')
    .optional(),
  avatar: z
    .string()
    .url('URL avatar non valido')
    .optional()
})
