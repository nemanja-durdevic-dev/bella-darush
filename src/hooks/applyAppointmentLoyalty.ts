import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'
import type { Appointment, Service } from '@/payload-types'
import {
  appointmentHasLoyaltyService,
  getLoyaltyProgressFromCount,
  LOYALTY_REQUIRED_APPOINTMENTS,
  LOYALTY_START_DATE,
} from '@/lib/appointmentLoyalty'

const CURRENT_APPOINTMENT_ID = '__current_appointment__'

type LoyaltyEntry = {
  id: string
  appointmentDate: string
  order: number
}

function getRelationshipId(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
    return value.id
  }

  return null
}

function getRelationshipIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value.map(getRelationshipId).filter((id): id is string => Boolean(id))
}

function getEmptyLoyaltyState() {
  return {
    isFree: false,
    qualifyingCount: 0,
    progressCount: 0,
  }
}

function getCycleEnd(cycleStart: string): string {
  const end = new Date(cycleStart)
  end.setUTCFullYear(end.getUTCFullYear() + 1)

  return end.toISOString()
}

function getLoyaltyState(qualifyingCount: number) {
  const isFree = qualifyingCount === LOYALTY_REQUIRED_APPOINTMENTS

  return {
    isFree,
    qualifyingCount,
    progressCount: getLoyaltyProgressFromCount(qualifyingCount),
  }
}

function sortLoyaltyEntries(entries: LoyaltyEntry[]): LoyaltyEntry[] {
  return [...entries].sort((a, b) => {
    if (a.appointmentDate !== b.appointmentDate) {
      return a.appointmentDate.localeCompare(b.appointmentDate)
    }

    if (a.order !== b.order) {
      return a.order - b.order
    }

    return a.id.localeCompare(b.id)
  })
}

function getLoyaltyStateForEntry(entries: LoyaltyEntry[], targetId: string) {
  let cycleStart: string | null = null
  let qualifyingCount = 0

  for (const entry of sortLoyaltyEntries(entries)) {
    if (!cycleStart || entry.appointmentDate >= getCycleEnd(cycleStart)) {
      cycleStart = entry.appointmentDate
      qualifyingCount = 0
    }

    qualifyingCount += 1

    const loyaltyState = getLoyaltyState(qualifyingCount)

    if (entry.id === targetId) {
      return loyaltyState
    }
  }

  return getEmptyLoyaltyState()
}

export const applyAppointmentLoyalty: CollectionBeforeChangeHook<Appointment> = async ({
  context,
  data,
  originalDoc,
  req,
}) => {
  if (context?.skipLoyalty) {
    return data
  }

  const customerId = getRelationshipId(data.customer ?? originalDoc?.customer)
  const serviceIds = getRelationshipIds(data.service ?? originalDoc?.service)
  const appointmentDate = data.appointmentDate ?? originalDoc?.appointmentDate
  const status = data.status ?? originalDoc?.status ?? 'confirmed'

  if (
    !customerId ||
    serviceIds.length === 0 ||
    !appointmentDate ||
    appointmentDate < LOYALTY_START_DATE ||
    status === 'cancelled'
  ) {
    data.loyalty = getEmptyLoyaltyState()
    return data
  }

  const services = (await Promise.all(
    serviceIds.map((id) =>
      req.payload.findByID({
        collection: 'services',
        id,
        depth: 0,
        req,
      }),
    ),
  )) as Service[]

  if (!appointmentHasLoyaltyService(services)) {
    data.loyalty = getEmptyLoyaltyState()
    return data
  }

  const existingAppointments = await req.payload.find({
    collection: 'appointments',
    where: {
      and: [
        { customer: { equals: customerId } },
        { status: { in: ['confirmed', 'completed'] } },
        { appointmentDate: { greater_than_equal: LOYALTY_START_DATE } },
      ],
    },
    depth: 1,
    limit: 1000,
    sort: 'appointmentDate',
    req,
  })

  const currentEntryId = originalDoc?.id ?? CURRENT_APPOINTMENT_ID
  const previousQualifyingEntries = existingAppointments.docs.flatMap((appointment) => {
    if (appointment.id === currentEntryId) return []

    const appointmentServices = Array.isArray(appointment.service)
      ? (appointment.service as Service[])
      : [appointment.service as Service]

    if (!appointmentHasLoyaltyService(appointmentServices)) return []

    return [
      {
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        order: 0,
      },
    ]
  })

  data.loyalty = getLoyaltyStateForEntry(
    [
      ...previousQualifyingEntries,
      {
        id: currentEntryId,
        appointmentDate,
        order: 1,
      },
    ],
    currentEntryId,
  )

  return data
}

export const syncCustomerAppointmentLoyalty: CollectionAfterChangeHook<Appointment> = async ({
  context,
  doc,
  req,
}) => {
  if (context?.skipLoyaltySync) {
    return doc
  }

  const customerId = getRelationshipId(doc.customer)
  if (!customerId) return doc

  const appointments = await req.payload.find({
    collection: 'appointments',
    where: {
      and: [
        { customer: { equals: customerId } },
        { status: { in: ['confirmed', 'completed'] } },
        { appointmentDate: { greater_than_equal: LOYALTY_START_DATE } },
      ],
    },
    depth: 1,
    limit: 1000,
    sort: 'appointmentDate',
    req,
  })

  const loyaltyEntries: LoyaltyEntry[] = []

  for (const appointment of appointments.docs) {
    const appointmentServices = Array.isArray(appointment.service)
      ? (appointment.service as Service[])
      : [appointment.service as Service]

    if (!appointmentHasLoyaltyService(appointmentServices)) {
      continue
    }

    loyaltyEntries.push({
      id: appointment.id,
      appointmentDate: appointment.appointmentDate,
      order: 0,
    })
  }

  const syncedLoyaltyByAppointmentId = new Map<string, ReturnType<typeof getLoyaltyState>>()

  let cycleStart: string | null = null
  let qualifyingCount = 0

  for (const entry of sortLoyaltyEntries(loyaltyEntries)) {
    if (!cycleStart || entry.appointmentDate >= getCycleEnd(cycleStart)) {
      cycleStart = entry.appointmentDate
      qualifyingCount = 0
    }

    qualifyingCount += 1
    syncedLoyaltyByAppointmentId.set(entry.id, getLoyaltyState(qualifyingCount))
  }

  for (const appointment of appointments.docs) {
    const nextLoyalty = syncedLoyaltyByAppointmentId.get(appointment.id) ?? getEmptyLoyaltyState()

    const currentLoyalty = appointment.loyalty
    const isAlreadySynced =
      currentLoyalty?.isFree === nextLoyalty.isFree &&
      currentLoyalty?.qualifyingCount === nextLoyalty.qualifyingCount &&
      currentLoyalty?.progressCount === nextLoyalty.progressCount

    if (isAlreadySynced) {
      continue
    }

    await req.payload.update({
      collection: 'appointments',
      id: appointment.id,
      data: {
        loyalty: nextLoyalty,
      },
      context: {
        skipEmails: true,
        skipLoyalty: true,
        skipLoyaltySync: true,
      },
      req,
    })
  }

  return doc
}
