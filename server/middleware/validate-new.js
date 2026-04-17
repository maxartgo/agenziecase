// Input Validation Middleware con Zod
import { z } from 'zod';

/**
 * Helper per creare middleware di validazione
 */
export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Dati non validi',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
};

/**
 * Zod Schemi per Auth
 */
export const authSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email().min(5).max(255).toLowerCase().trim(),
      password: z.string()
        .min(8, 'Password deve essere almeno 8 caratteri')
        .regex(/[A-Z]/, 'Almeno una maiuscola')
        .regex(/[a-z]/, 'Almeno una minuscola')
        .regex(/[0-9]/, 'Almeno un numero')
        .regex(/[^A-Za-z0-9]/, 'Almeno un carattere speciale'),
      firstName: z.string().min(2).max(50).trim(),
      lastName: z.string().min(2).max(50).trim(),
      phone: z.string().regex(/^[+]?[\d\s\-()]+$/).optional()
    })
  }),

  login: z.object({
    body: z.object({
      email: z.string().email().toLowerCase().trim(),
      password: z.string().min(1)
    })
  }),

  changePassword: z.object({
    body: z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string()
        .min(8)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/[0-9]/)
    })
  })
};

/**
 * Zod Schemi per Property
 */
export const propertySchemas = {
  create: z.object({
    body: z.object({
      title: z.string().min(5).max(255).trim(),
      description: z.string().max(5000).optional(),
      location: z.string().min(2).max(255).trim(),
      city: z.string().min(2).max(100).trim(),
      price: z.number().positive().max(100000000),
      sqm: z.number().positive().max(10000),
      rooms: z.number().int().positive().max(50),
      bathrooms: z.number().int().positive().max(20),
      type: z.enum(['Vendita', 'Affitto']),
      status: z.enum(['disponibile', 'prenotato', 'venduto', 'affittato']).optional()
    })
  }),

  filter: z.object({
    query: z.object({
      type: z.enum(['Vendita', 'Affitto']).optional(),
      city: z.string().optional(),
      minPrice: z.string().regex(/^\d+$/).transform(Number).optional(),
      maxPrice: z.string().regex(/^\d+$/).transform(Number).optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['ASC', 'DESC']).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
      offset: z.string().regex(/^\d+$/).transform(Number).optional()
    })
  })
};

export const validationSchemas = {
  auth: authSchemas,
  property: propertySchemas
};
