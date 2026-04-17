// server/validations/crm.validation.js
import { z } from 'zod'

// Client status enum
const clientStatusEnum = z.enum([
  'lead',
  'prospect',
  'active',
  'inactive',
  'lost'
], {
  errorMap: () => ({ message: 'Stato cliente non valido' })
})

// Create client validation schema
export const createClientSchema = z.object({
  name: z
    .string()
    .min(2, 'Il nome deve essere di almeno 2 caratteri')
    .max(100, 'Il nome non può superare i 100 caratteri')
    .trim(),
  surname: z
    .string()
    .min(2, 'Il cognome deve essere di almeno 2 caratteri')
    .max(100, 'Il cognome non può superare i 100 caratteri')
    .trim(),
  email: z
    .string()
    .email('Email non valida')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-()]+$/, 'Numero di telefono non valido')
    .optional(),
  budget: z
    .number()
    .min(0, 'Il budget non può essere negativo')
    .optional(),
  status: clientStatusEnum.default('lead'),
  notes: z
    .string()
    .max(2000, 'Le note non possono superare i 2000 caratteri')
    .optional(),
  source: z
    .enum(['website', 'social', 'referral', 'advertising', 'other'], {
      errorMap: () => ({ message: 'Fonte non valida' })
    })
    .optional()
})

// Update client validation schema
export const updateClientSchema = createClientSchema.partial()

// Appointment status enum
const appointmentStatusEnum = z.enum([
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
], {
  errorMap: () => ({ message: 'Stato appuntamento non valido' })
})

// Create appointment validation schema
export const createAppointmentSchema = z.object({
  clientId: z
    .number()
    .int('ID cliente deve essere intero')
    .positive('ID cliente deve essere positivo'),
  propertyId: z
    .number()
    .int('ID proprietà deve essere intero')
    .positive('ID proprietà deve essere positivo')
    .optional(),
  title: z
    .string()
    .min(5, 'Il titolo deve essere di almeno 5 caratteri')
    .max(200, 'Il titolo non può superare i 200 caratteri')
    .trim(),
  description: z
    .string()
    .max(1000, 'La descrizione non può superare i 1000 caratteri')
    .optional(),
  dateTime: z
    .string()
    .datetime('Data e ora non valide')
    .transform((val) => new Date(val))
    .refine((date) => date > new Date(), {
      message: 'La data deve essere nel futuro'
    }),
  duration: z
    .number()
    .int('La durata deve essere intera')
    .positive('La durata deve essere positiva')
    .max(480, 'La durata non può superare 480 minuti (8 ore)')
    .default(60),
  location: z
    .string()
    .max(200, 'La location non può superare i 200 caratteri')
    .optional(),
  status: appointmentStatusEnum.default('scheduled'),
  notes: z
    .string()
    .max(1000, 'Le note non possono superare i 1000 caratteri')
    .optional()
})

// Update appointment validation schema
export const updateAppointmentSchema = createAppointmentSchema.partial()

// Deal status enum
const dealStatusEnum = z.enum([
  'lead',
  'negotiation',
  'proposal_sent',
  'accepted',
  'rejected',
  'closed'
], {
  errorMap: () => ({ message: 'Stato trattativa non valido' })
})

// Create deal validation schema
export const createDealSchema = z.object({
  clientId: z
    .number()
    .int('ID cliente deve essere intero')
    .positive('ID cliente deve essere positivo'),
  propertyId: z
    .number()
    .int('ID proprietà deve essere intero')
    .positive('ID proprietà deve essere positivo')
    .optional(),
  title: z
    .string()
    .min(5, 'Il titolo deve essere di almeno 5 caratteri')
    .max(200, 'Il titolo non può superare i 200 caratteri')
    .trim(),
  description: z
    .string()
    .max(2000, 'La descrizione non può superare i 2000 caratteri')
    .optional(),
  value: z
    .number()
    .min(0, 'Il valore non può essere negativo')
    .optional(),
  status: dealStatusEnum.default('lead'),
  probability: z
    .number()
    .min(0, 'La probabilità deve essere tra 0 e 100')
    .max(100, 'La probabilità deve essere tra 0 e 100')
    .default(50),
  expectedCloseDate: z
    .string()
    .datetime('Data chiusura prevista non valida')
    .transform((val) => new Date(val))
    .refine((date) => date > new Date(), {
      message: 'La data deve essere nel futuro'
    })
    .optional(),
  notes: z
    .string()
    .max(2000, 'Le note non possono superare i 2000 caratteri')
    .optional()
})

// Update deal validation schema
export const updateDealSchema = createDealSchema.partial()

// Activity type enum
const activityTypeEnum = z.enum([
  'call',
  'email',
  'meeting',
  'visit',
  'note',
  'reminder'
], {
  errorMap: () => ({ message: 'Tipo attività non valido' })
})

// Create activity validation schema
export const createActivitySchema = z.object({
  clientId: z
    .number()
    .int('ID cliente deve essere intero')
    .positive('ID cliente deve essere positivo')
    .optional(),
  dealId: z
    .number()
    .int('ID trattativa deve essere intero')
    .positive('ID trattativa deve essere positivo')
    .optional(),
  appointmentId: z
    .number()
    .int('ID appuntamento deve essere intero')
    .positive('ID appuntamento deve essere positivo')
    .optional(),
  type: activityTypeEnum,
  title: z
    .string()
    .min(5, 'Il titolo deve essere di almeno 5 caratteri')
    .max(200, 'Il titolo non può superare i 200 caratteri')
    .trim(),
  description: z
    .string()
    .max(2000, 'La descrizione non può superare i 2000 caratteri')
    .optional(),
  dateTime: z
    .string()
    .datetime('Data e ora non valide')
    .transform((val) => new Date(val))
    .default(() => new Date()),
  completed: z
    .boolean()
    .default(false),
  notes: z
    .string()
    .max(1000, 'Le note non possono superare i 1000 caratteri')
    .optional()
})
.refine((data) => {
  // Almeno uno tra clientId, dealId, appointmentId deve essere presente
  return !!(data.clientId || data.dealId || data.appointmentId)
}, {
  message: 'Almeno un ID (cliente, trattativa o appuntamento) è richiesto',
  path: []
})

// Update activity validation schema
export const updateActivitySchema = createActivitySchema.partial()
