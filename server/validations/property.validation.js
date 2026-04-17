// server/validations/property.validation.js
import { z } from 'zod'

// Property type enum
const propertyTypeEnum = z.enum([
  'appartamento',
  'villa',
  'casa',
  'attico',
  'loft',
  'terreno',
  'garage',
  'ufficio',
  'negozio',
  'capannone',
  'altro'
], {
  errorMap: () => ({ message: 'Tipo di proprietà non valido' })
})

// Property status enum
const propertyStatusEnum = z.enum([
  'available',
  'sold',
  'reserved',
  'under_offer',
  'maintenance'
], {
  errorMap: () => ({ message: 'Stato non valido' })
})

// Create property validation schema
export const createPropertySchema = z.object({
  title: z
    .string()
    .min(5, 'Il titolo deve essere di almeno 5 caratteri')
    .max(200, 'Il titolo non può superare i 200 caratteri')
    .trim(),
  description: z
    .string()
    .min(20, 'La descrizione deve essere di almeno 20 caratteri')
    .max(5000, 'La descrizione non può superare i 5000 caratteri')
    .trim(),
  price: z
    .number()
    .min(1, 'Il prezzo deve essere maggiore di 0')
    .max(100000000, 'Il prezzo non può superare 100.000.000'),
  city: z
    .string()
    .min(2, 'La città deve essere di almeno 2 caratteri')
    .max(100, 'La città non può superare i 100 caratteri')
    .trim(),
  address: z
    .string()
    .min(5, 'L\'indirizzo deve essere di almeno 5 caratteri')
    .max(200, 'L\'indirizzo non può superare i 200 caratteri')
    .trim(),
  surface: z
    .number()
    .min(1, 'La superficie deve essere maggiore di 0')
    .max(100000, 'La superficie non può superare 100.000 mq'),
  rooms: z
    .number()
    .int('Il numero di stanze deve essere intero')
    .min(1, 'Deve esserci almeno 1 stanza')
    .max(100, 'Non può superare 100 stanze')
    .optional(),
  bathrooms: z
    .number()
    .int('Il numero di bagni deve essere intero')
    .min(1, 'Deve esserci almeno 1 bagno')
    .max(50, 'Non può superare 50 bagni')
    .optional(),
  floor: z
    .number()
    .int('Il piano deve essere intero')
    .min(-3, 'Il piano non può essere inferiore a -3')
    .max(200, 'Il piano non può superare 200')
    .optional(),
  type: propertyTypeEnum,
  status: propertyStatusEnum.default('available'),
  energyClass: z
    .enum(['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'], {
      errorMap: () => ({ message: 'Classe energetica non valida' })
    })
    .optional(),
  yearBuilt: z
    .number()
    .int('L\'anno deve essere intero')
    .min(1800, 'L\'anno non può essere inferiore al 1800')
    .max(new Date().getFullYear() + 1, 'Anno non valido')
    .optional(),
  hasGarage: z
    .boolean()
    .optional(),
  hasGarden: z
    .boolean()
    .optional(),
  hasPool: z
    .boolean()
    .optional(),
  hasTerrace: z
    .boolean()
    .optional(),
  furnished: z
    .boolean()
    .optional(),
  images: z
    .array(z.string().url('URL immagine non valido'))
    .min(1, 'Almeno un\'immagine è richiesta')
    .max(50, 'Non puoi caricare più di 50 immagini'),
  virtualTour: z
    .string()
    .url('URL virtual tour non valido')
    .optional(),
  latitude: z
    .number()
    .min(-90, 'Latitudine non valida')
    .max(90, 'Latitudine non valida')
    .optional(),
  longitude: z
    .number()
    .min(-180, 'Longitudine non valida')
    .max(180, 'Longitudine non valida')
    .optional(),
  isActive: z
    .boolean()
    .default(true)
})

// Update property validation schema (all fields optional)
export const updatePropertySchema = createPropertySchema.partial()

// Property filter validation schema
export const propertyFilterSchema = z.object({
  minPrice: z
    .number()
    .min(0, 'Il prezzo minimo non può essere negativo')
    .optional(),
  maxPrice: z
    .number()
    .min(0, 'Il prezzo massimo non può essere negativo')
    .optional(),
  city: z
    .string()
    .trim()
    .optional(),
  type: propertyTypeEnum.optional(),
  status: propertyStatusEnum.optional(),
  minSurface: z
    .number()
    .min(0, 'La superficie minima non può essere negativa')
    .optional(),
  maxSurface: z
    .number()
    .min(0, 'La superficie massima non può essere negativa')
    .optional(),
  minRooms: z
    .number()
    .int()
    .min(1)
    .optional(),
  maxRooms: z
    .number()
    .int()
    .min(1)
    .optional(),
  energyClass: z
    .enum(['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'])
    .optional(),
  hasGarage: z
    .boolean()
    .optional(),
  hasGarden: z
    .boolean()
    .optional(),
  hasPool: z
    .boolean()
    .optional(),
  furnished: z
    .boolean()
    .optional(),
  page: z
    .number()
    .int()
    .positive('Il numero di pagina deve essere positivo')
    .default(1),
  limit: z
    .number()
    .int()
    .positive('Il limite deve essere positivo')
    .max(100, 'Il limite non può superare 100')
    .default(20),
  sortBy: z
    .enum(['price', 'surface', 'createdAt', 'updatedAt'])
    .default('createdAt'),
  order: z
    .enum(['asc', 'desc'])
    .default('desc')
})
