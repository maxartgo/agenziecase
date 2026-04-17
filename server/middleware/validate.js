// server/middleware/validate.js
import { ZodError } from 'zod'

/**
 * Middleware per validare request body usando Zod schema
 * @param {ZodSchema} schema - Zod schema per validazione
 * @param {string} property - Proprietà da validare ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      // Validazione in base alla proprietà specificata
      let dataToValidate

      switch (property) {
        case 'body':
          dataToValidate = req.body
          break
        case 'query':
          dataToValidate = req.query
          break
        case 'params':
          dataToValidate = req.params
          break
        default:
          dataToValidate = req.body
      }

      // Validazione con Zod
      const validatedData = schema.parse(dataToValidate)

      // Sostituisci i dati con quelli validati
      req[property] = validatedData

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatta errori Zod per risposta user-friendly
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))

        return res.status(400).json({
          error: 'Dati non validi',
          details: formattedErrors
        })
      }

      // Altri errori
      console.error('Validation error:', error)
      return res.status(500).json({
        error: 'Errore durante la validazione'
      })
    }
  }
}

/**
 * Middleware per validare query string
 */
export const validateQuery = (schema) => {
  return validate(schema, 'query')
}

/**
 * Middleware per validare route parameters
 */
export const validateParams = (schema) => {
  return validate(schema, 'params')
}

/**
 * Helper per validare ID numerico nei params
 */
export const validateIdParam = (paramName = 'id') => {
  return validateParams(
    z.object({
      [paramName]: z
        .string()
        .regex(/^\d+$/, `${paramName} deve essere un numero intero`)
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0, `${paramName} deve essere positivo`)
    })
  )
}

// ============================================================================
// ZOD SCHEMAS - Validazione Dati
// ============================================================================

import { z } from 'zod'

/**
 * Schemi di Validazione Auth
 */
export const authSchemas = {
  register: z.object({
    email: z.string()
      .email('Email non valida')
      .min(5, 'Email troppo corta')
      .max(255, 'Email troppo lunga')
      .toLowerCase()
      .trim(),
    password: z.string()
      .min(8, 'Password deve essere almeno 8 caratteri')
      .regex(/[A-Z]/, 'Password deve contenere almeno una maiuscola')
      .regex(/[a-z]/, 'Password deve contenere almeno una minuscola')
      .regex(/[0-9]/, 'Password deve contenere almeno un numero')
      .regex(/[^A-Za-z0-9]/, 'Password deve contenere almeno un carattere speciale'),
    firstName: z.string()
      .min(2, 'Nome troppo corto')
      .max(50, 'Nome troppo lungo')
      .trim(),
    lastName: z.string()
      .min(2, 'Cognome troppo corto')
      .max(50, 'Cognome troppo lungo')
      .trim(),
    phone: z.string()
      .regex(/^[+]?[\d\s\-()]+$/, 'Telefono non valido')
      .optional()
  }),

  login: z.object({
    email: z.string()
      .email('Email non valida')
      .toLowerCase()
      .trim(),
    password: z.string()
      .min(1, 'Password richiesta')
  }),

  changePassword: z.object({
    currentPassword: z.string()
      .min(1, 'Password attuale richiesta'),
    newPassword: z.string()
      .min(8, 'Password deve essere almeno 8 caratteri')
      .regex(/[A-Z]/, 'Almeno una maiuscola')
      .regex(/[a-z]/, 'Almeno una minuscola')
      .regex(/[0-9]/, 'Almeno un numero')
  }),

  updateProfile: z.object({
    firstName: z.string()
      .min(2)
      .max(50)
      .trim()
      .optional(),
    lastName: z.string()
      .min(2)
      .max(50)
      .trim()
      .optional(),
    phone: z.string()
      .regex(/^[+]?[\d\s\-()]+$/, 'Telefono non valido')
      .optional(),
    avatar: z.string()
      .url('URL avatar non valido')
      .optional()
  })
}

/**
 * Schemi di Validazione Property
 */
export const propertySchemas = {
  create: z.object({
    title: z.string()
      .min(5, 'Titolo troppo corto')
      .max(255, 'Titolo troppo lungo')
      .trim(),
    description: z.string()
      .max(5000, 'Descrizione troppo lunga')
      .optional(),
    location: z.string()
      .min(2, 'Luogo troppo corto')
      .max(255, 'Luogo troppo lungo')
      .trim(),
    city: z.string()
      .min(2, 'Città troppo corta')
      .max(100, 'Città troppo lunga')
      .trim(),
    address: z.string()
      .max(255, 'Indirizzo troppo lungo')
      .optional(),
    price: z.number()
      .positive('Prezzo deve essere positivo')
      .max(100000000, 'Prezzo troppo elevato'),
    sqm: z.number()
      .positive('Superficie deve essere positiva')
      .max(10000, 'Superficie troppo elevata'),
    rooms: z.number()
      .int('Locali deve essere intero')
      .positive('Locali deve essere positivo')
      .max(50, 'Troppi locali'),
    bathrooms: z.number()
      .int('Bagni deve essere intero')
      .positive('Bagni deve essere positivo')
      .max(20, 'Troppi bagni'),
    propertyType: z.string()
      .max(100, 'Tipo proprietà troppo lungo')
      .optional(),
    type: z.enum(['Vendita', 'Affitto'], {
      errorMap: () => ({ message: 'Tipo deve essere Vendita o Affitto' })
    }),
    status: z.enum(['disponibile', 'prenotato', 'venduto', 'affittato'], {
      errorMap: () => ({ message: 'Status non valido' })
    }).optional(),
    energyClass: z.enum(['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'], {
      errorMap: () => ({ message: 'Classe energetica non valida' })
    }).optional()
  }),

  update: z.object({
    title: z.string()
      .min(5)
      .max(255)
      .trim()
      .optional(),
    description: z.string()
      .max(5000)
      .optional(),
    price: z.number()
      .positive()
      .max(100000000)
      .optional(),
    status: z.enum(['disponibile', 'prenotato', 'venduto', 'affittato'])
      .optional()
  }).partial(), // Tutti i campi optional

  filter: z.object({
    type: z.enum(['Vendita', 'Affitto']).optional(),
    city: z.string().optional(),
    minPrice: z.string()
      .regex(/^\d+(\.\d+)?$/, 'Prezzo minimo non valido')
      .transform(Number)
      .optional(),
    maxPrice: z.string()
      .regex(/^\d+(\.\d+)?$/, 'Prezzo massimo non valido')
      .transform(Number)
      .optional(),
    minSqm: z.string()
      .regex(/^\d+$/, 'Superficie minima non valida')
      .transform(Number)
      .optional(),
    maxSqm: z.string()
      .regex(/^\d+$/, 'Superficie massima non valida')
      .transform(Number)
      .optional(),
    rooms: z.string()
      .regex(/^\d+$/, 'Locali non valido')
      .transform(Number)
      .optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['ASC', 'DESC']).optional(),
    limit: z.string()
      .regex(/^\d+$/, 'Limit non valido')
      .transform(Number)
      .optional(),
    offset: z.string()
      .regex(/^\d+$/, 'Offset non valido')
      .transform(Number)
      .optional()
  })
}

/**
 * Export di tutti gli schemi
 */
export const validationSchemas = {
  auth: authSchemas,
  property: propertySchemas
}
