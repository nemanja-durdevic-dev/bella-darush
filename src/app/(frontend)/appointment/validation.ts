import { z } from 'zod'

/**
 * Validation schemas for appointment booking flow
 * Each step has its own schema to validate searchParams
 */

// Step 1: Service selection - no params required
export const serviceStepSchema = z.object({})

const servicesParamSchema = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => (Array.isArray(value) ? value : [value]))
  .transform((value) => value.map((serviceId) => serviceId.trim()).filter(Boolean))
  .refine((value) => value.length > 0, 'Minst én tjeneste må velges')

// Step 2: Date/time selection - requires service and optional worker ID filter
export const datetimeStepSchema = z.object({
  service: servicesParamSchema,
  worker: z.string().min(1, 'Worker ID er påkrevd').optional(),
})

// Step 3: Confirmation - requires all booking details
export const confirmStepSchema = z.object({
  service: servicesParamSchema,
  worker: z.string().min(1, 'Worker ID er påkrevd'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ugyldig datoformat')
    .refine((date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'Datoen kan ikke være i fortiden'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Ugyldig tidsformat'),
})

// Customer information schema for form validation
export const customerInfoSchema = z.object({
  customerName: z.string().min(2, 'Navn må være minst 2 tegn').max(100, 'Navn er for langt'),
  customerEmail: z.string().email('Ugyldig e-postadresse'),
  customerPhone: z
    .string()
    .min(8, 'Telefonnummer må være minst 8 siffer')
    .regex(/^[\d\s+()-]+$/, 'Ugyldig telefonnummer format'),
  notes: z.string().max(500, 'Merknad kan ikke være lengre enn 500 tegn').optional(),
})

// Success page schema
export const successStepSchema = z.object({
  id: z.string().min(1, 'Appointment ID er påkrevd'),
})

// Helper type exports for TypeScript
export type ServiceStepParams = z.infer<typeof serviceStepSchema>
export type DatetimeStepParams = z.infer<typeof datetimeStepSchema>
export type ConfirmStepParams = z.infer<typeof confirmStepSchema>
export type CustomerInfo = z.infer<typeof customerInfoSchema>
export type SuccessStepParams = z.infer<typeof successStepSchema>
