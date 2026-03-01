import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const APPOINTMENT_SERVICE_PATH = '/appointment/service'

function shouldSkipRevalidation(context: unknown): boolean {
  if (!context || typeof context !== 'object') return false

  const typedContext = context as Record<string, unknown>
  return typedContext.skipEmails === true
}

export const revalidateAppointmentServicePageAfterChange: CollectionAfterChangeHook = async ({
  doc,
  context,
}) => {
  if (!shouldSkipRevalidation(context)) {
    revalidatePath(APPOINTMENT_SERVICE_PATH)
  }

  return doc
}

export const revalidateAppointmentServicePageAfterDelete: CollectionAfterDeleteHook = async ({
  context,
}) => {
  if (!shouldSkipRevalidation(context)) {
    revalidatePath(APPOINTMENT_SERVICE_PATH)
  }
}
