import type { CollectionBeforeChangeHook } from 'payload'
import { toAppointmentDateKey } from '@/lib/appointmentDate'

/**
 * Validates that the selected worker offers the selected service.
 * This ensures appointments can only be made for valid service-worker combinations.
 */
export const validateServiceWorker: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  // Only validate on create or update
  if (operation !== 'create' && operation !== 'update') {
    return data
  }

  const serviceIds = getServiceIds(data?.service ?? originalDoc?.service)
  const workerId = getRelationId(data?.worker ?? originalDoc?.worker)
  const appointmentDate = data?.appointmentDate ?? originalDoc?.appointmentDate

  // Skip if either field is missing (other validation will catch required fields)
  if (!serviceIds.length || !workerId) {
    return data
  }

  // Fetch the worker to check their services
  const worker = await req.payload.findByID({
    collection: 'workers',
    id: workerId,
    depth: 0, // Just get IDs, not populated data
    req,
  })

  if (!worker) {
    throw new Error('Selected worker not found')
  }

  const scheduleOverride = appointmentDate
    ? await getWorkerScheduleOverrideForDate(req, String(workerId), appointmentDate)
    : null

  if (scheduleOverride?.isClosed) {
    throw new Error(`${worker.name} er ikke tilgjengelig på valgt dato.`)
  }

  const overrideServiceIds = scheduleOverride
    ? getServiceIds((scheduleOverride as { availableServices?: unknown }).availableServices)
    : []
  const offeredServiceIds = new Set(
    overrideServiceIds.length ? overrideServiceIds : getServiceIds(worker.services),
  )

  const missingServiceIds = serviceIds.filter((serviceId) => !offeredServiceIds.has(serviceId))

  if (missingServiceIds.length > 0) {
    const missingServices = await req.payload.find({
      collection: 'services',
      where: {
        id: {
          in: missingServiceIds,
        },
      },
      limit: missingServiceIds.length,
      depth: 0,
      req,
    })

    const missingNames = missingServices.docs.map((service) => service.name).join(', ')

    throw new Error(
      `${worker.name} tilbyr ikke følgende tjenester: ${missingNames || missingServiceIds.join(', ')}. Velg en annen behandler eller juster tjenestene.`,
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

function getRelationId(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (value && typeof value === 'object' && 'id' in value) {
    return String(value.id)
  }

  return null
}

function getLocalDayRange(dateInput: string | Date): { startOfDay: string; endOfDay: string } {
  const dateKey = toAppointmentDateKey(dateInput)
  const [year, month, day] = dateKey.split('-').map(Number)
  const start = new Date(year, month - 1, day, 0, 0, 0, 0)
  const end = new Date(year, month - 1, day, 23, 59, 59, 999)
  return { startOfDay: start.toISOString(), endOfDay: end.toISOString() }
}

async function getWorkerScheduleOverrideForDate(
  req: Parameters<CollectionBeforeChangeHook>[0]['req'],
  workerId: string,
  appointmentDate: string | Date,
) {
  const { startOfDay, endOfDay } = getLocalDayRange(appointmentDate)

  const overrides = await req.payload.find({
    collection: 'schedule-overrides',
    where: {
      and: [
        { worker: { equals: workerId } },
        { date: { greater_than_equal: startOfDay } },
        { date: { less_than_equal: endOfDay } },
      ],
    },
    sort: '-createdAt',
    limit: 1,
    depth: 0,
    req,
  })

  return overrides.docs[0] ?? null
}
