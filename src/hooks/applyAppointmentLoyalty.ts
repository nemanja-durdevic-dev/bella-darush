import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'
import type { Appointment, Service } from '@/payload-types'
import {
  appointmentHasLoyaltyService,
  getLoyaltyProgressFromCount,
  LOYALTY_REQUIRED_APPOINTMENTS,
} from '@/lib/appointmentLoyalty'

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

function getAppointmentYear(dateString: string): number {
  return new Date(dateString).getUTCFullYear()
}

function getLoyaltyState(
  qualifyingCount: number,
  redeemedRewards: number,
  hasRedeemedThisYear: boolean,
) {
  const earnedRewards = Math.floor(qualifyingCount / LOYALTY_REQUIRED_APPOINTMENTS)
  const hasAvailableReward = earnedRewards > redeemedRewards
  const isFree = hasAvailableReward && !hasRedeemedThisYear

  return {
    isFree,
    qualifyingCount,
    progressCount:
      hasAvailableReward && !isFree
        ? LOYALTY_REQUIRED_APPOINTMENTS
        : getLoyaltyProgressFromCount(qualifyingCount),
  }
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

  if (!customerId || serviceIds.length === 0 || !appointmentDate || status === 'cancelled') {
    data.loyalty = {
      isFree: false,
      qualifyingCount: 0,
      progressCount: 0,
    }
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
    data.loyalty = {
      isFree: false,
      qualifyingCount: 0,
      progressCount: 0,
    }
    return data
  }

  const appointmentYear = getAppointmentYear(appointmentDate)

  const existingAppointments = await req.payload.find({
    collection: 'appointments',
    where: {
      and: [{ customer: { equals: customerId } }, { status: { in: ['confirmed', 'completed'] } }],
    },
    depth: 1,
    limit: 1000,
    sort: 'appointmentDate',
    req,
  })

  const previousQualifyingAppointments = existingAppointments.docs.filter((appointment) => {
    if (originalDoc?.id && appointment.id === originalDoc.id) return false

    const appointmentServices = Array.isArray(appointment.service)
      ? (appointment.service as Service[])
      : [appointment.service as Service]

    return appointmentHasLoyaltyService(appointmentServices)
  })

  const qualifyingCount = previousQualifyingAppointments.length + 1
  const redeemedRewards = previousQualifyingAppointments.filter(
    (appointment) => appointment.loyalty?.isFree,
  ).length
  const hasRedeemedThisYear = previousQualifyingAppointments.some(
    (appointment) =>
      appointment.loyalty?.isFree &&
      getAppointmentYear(appointment.appointmentDate) === appointmentYear,
  )

  data.loyalty = getLoyaltyState(qualifyingCount, redeemedRewards, hasRedeemedThisYear)

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
      and: [{ customer: { equals: customerId } }, { status: { in: ['confirmed', 'completed'] } }],
    },
    depth: 1,
    limit: 1000,
    sort: 'appointmentDate',
    req,
  })

  let qualifyingCount = 0
  let redeemedRewards = 0
  const redeemedRewardYears = new Set<number>()

  for (const appointment of appointments.docs) {
    const appointmentServices = Array.isArray(appointment.service)
      ? (appointment.service as Service[])
      : [appointment.service as Service]

    if (!appointmentHasLoyaltyService(appointmentServices)) {
      continue
    }

    qualifyingCount += 1

    const appointmentYear = getAppointmentYear(appointment.appointmentDate)
    const nextLoyalty = getLoyaltyState(
      qualifyingCount,
      redeemedRewards,
      redeemedRewardYears.has(appointmentYear),
    )

    if (nextLoyalty.isFree) {
      redeemedRewards += 1
      redeemedRewardYears.add(appointmentYear)
    }

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
