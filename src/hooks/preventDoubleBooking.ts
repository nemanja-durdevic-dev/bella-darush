import type { CollectionBeforeChangeHook, Where } from 'payload'
import { formatAppointmentDateNorwegian, toAppointmentDateKey } from '@/lib/appointmentDate'

/**
 * Prevents double booking by checking if a worker already has an appointment
 * at the same date and time (excluding cancelled appointments)
 */
export const preventDoubleBooking: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  // Only validate on create or when appointment details change
  if (operation !== 'create' && operation !== 'update') {
    return data
  }

  const workerId = data?.worker
  const appointmentDate = data?.appointmentDate
  const appointmentTime = data?.appointmentTime
  const serviceIds = getServiceIds(data?.service)
  const normalizedAppointmentDate = toAppointmentDateKey(appointmentDate)

  // Skip if essential fields are missing
  if (!workerId || !appointmentDate || !appointmentTime || serviceIds.length === 0) {
    return data
  }

  // Skip validation if status is being changed to cancelled
  if (data?.status === 'cancelled') {
    return data
  }

  // Build query to check for conflicting appointments
  const conditions: Where[] = [
    { worker: { equals: workerId } },
    {
      status: {
        not_in: ['cancelled'],
      },
    },
  ]

  // If updating, exclude the current document from the check
  if (operation === 'update' && originalDoc?.id) {
    conditions.push({
      id: { not_equals: originalDoc.id },
    })
  }

  const query: Where = { and: conditions }

  const existingAppointments = await req.payload.find({
    collection: 'appointments',
    where: query,
    limit: 200,
    req, // Pass req for transaction safety
  })

  const newAppointmentStart = timeToMinutes(appointmentTime)
  const durationMap = await getServiceDurationMap(req, [
    ...serviceIds,
    ...existingAppointments.docs.flatMap((appointment) => getServiceIds(appointment.service)),
  ])
  const newAppointmentDuration = getTotalDuration(serviceIds, durationMap)
  const newAppointmentEnd = newAppointmentStart + newAppointmentDuration

  const hasConflict = existingAppointments.docs.some((appointment) => {
    if (toAppointmentDateKey(appointment.appointmentDate) !== normalizedAppointmentDate) {
      return false
    }

    const existingStart = timeToMinutes(appointment.appointmentTime)
    const existingDuration = getTotalDuration(getServiceIds(appointment.service), durationMap)
    const existingEnd = existingStart + existingDuration

    return newAppointmentStart < existingEnd && newAppointmentEnd > existingStart
  })

  if (hasConflict) {
    throw new Error(
      `This worker already has an appointment at ${appointmentTime} on ${formatAppointmentDateNorwegian(appointmentDate)}. Please choose a different time or worker.`,
    )
  }

  return data
}

function getServiceIds(serviceValue: unknown): string[] {
  if (Array.isArray(serviceValue)) {
    return serviceValue
      .map((service) => {
        if (typeof service === 'string' || typeof service === 'number') {
          return String(service)
        }

        if (service && typeof service === 'object' && 'id' in service) {
          return String(service.id)
        }

        return ''
      })
      .filter(Boolean)
  }

  if (typeof serviceValue === 'string' || typeof serviceValue === 'number') {
    return [String(serviceValue)]
  }

  if (serviceValue && typeof serviceValue === 'object' && 'id' in serviceValue) {
    return [String(serviceValue.id)]
  }

  return []
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

async function getServiceDurationMap(
  req: Parameters<CollectionBeforeChangeHook>[0]['req'],
  serviceIds: string[],
): Promise<Map<string, number>> {
  const uniqueIds = Array.from(new Set(serviceIds.filter(Boolean)))
  const map = new Map<string, number>()

  if (uniqueIds.length === 0) {
    return map
  }

  const { docs } = await req.payload.find({
    collection: 'services',
    where: {
      id: {
        in: uniqueIds,
      },
    },
    limit: uniqueIds.length,
    depth: 0,
    req,
  })

  for (const service of docs) {
    map.set(service.id, service.duration ?? 30)
  }

  return map
}

function getTotalDuration(serviceIds: string[], durationMap: Map<string, number>): number {
  const duration = serviceIds.reduce(
    (sum, serviceId) => sum + (durationMap.get(serviceId) ?? 30),
    0,
  )
  return duration > 0 ? duration : 30
}
