import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Validates that the selected worker offers the selected service.
 * This ensures appointments can only be made for valid service-worker combinations.
 */
export const validateServiceWorker: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  // Only validate on create or update
  if (operation !== 'create' && operation !== 'update') {
    return data
  }

  const serviceIds = Array.isArray(data?.service)
    ? data.service.map((value: unknown) => String(value)).filter(Boolean)
    : data?.service
      ? [String(data.service)]
      : []
  const workerId = data?.worker

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

  // Check if the worker offers this service
  const workerServices = worker.services || []
  const offeredServiceIds = new Set(
    workerServices.map((s: string | number | { id: string | number }) => {
      const id = typeof s === 'string' || typeof s === 'number' ? s : s.id
      return String(id)
    }),
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
