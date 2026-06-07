import { describe, expect, it, vi } from 'vitest'
import type { Appointment, Service } from '@/payload-types'
import { applyAppointmentLoyalty } from '@/hooks/applyAppointmentLoyalty'
import {
  appointmentHasLoyaltyService,
  getLoyaltyPricing,
  getLoyaltyProgressFromCount,
} from '@/lib/appointmentLoyalty'
import { normalizeEmail } from '@/lib/normalizeEmail'

const now = '2026-01-01T00:00:00.000Z'

function service(overrides: Partial<Service> = {}): Service {
  return {
    id: overrides.id ?? 'service-1',
    name: overrides.name ?? 'Herreklipp',
    duration: overrides.duration ?? 30,
    price: overrides.price ?? 450,
    countsTowardLoyalty: overrides.countsTowardLoyalty ?? true,
    isActive: true,
    updatedAt: now,
    createdAt: now,
    ...overrides,
  }
}

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: overrides.id ?? 'appointment-1',
    customer: overrides.customer ?? 'customer-1',
    service: overrides.service ?? ['service-1'],
    worker: overrides.worker ?? 'worker-1',
    appointmentDate: overrides.appointmentDate ?? '2027-06-01T00:00:00.000Z',
    appointmentTime: overrides.appointmentTime ?? '12:00',
    status: overrides.status ?? 'confirmed',
    loyalty: overrides.loyalty,
    updatedAt: now,
    createdAt: now,
    ...overrides,
  }
}

function previousAppointments(count: number, options: { year?: number; freeAt?: number[] } = {}) {
  const year = options.year ?? 2027
  const freeAt = new Set(options.freeAt ?? [])

  return Array.from({ length: count }, (_, index) => {
    const qualifyingCount = index + 1

    return appointment({
      id: `previous-${qualifyingCount}`,
      appointmentDate: `${year}-07-${String(Math.min(qualifyingCount, 28)).padStart(2, '0')}T00:00:00.000Z`,
      service: [service({ id: 'service-1' })],
      loyalty: {
        isFree: freeAt.has(qualifyingCount),
        qualifyingCount,
        progressCount: getLoyaltyProgressFromCount(qualifyingCount),
      },
    })
  })
}

async function applyLoyalty({
  data,
  existingAppointments,
  services = [service({ id: 'service-1' })],
}: {
  data: Partial<Appointment>
  existingAppointments: Appointment[]
  services?: Service[]
}) {
  const serviceMap = new Map(services.map((item) => [item.id, item]))
  const req = {
    payload: {
      findByID: vi.fn(({ id }) => serviceMap.get(id)),
      find: vi.fn(({ where }) => {
        const startDate = where?.and?.find(
          (condition: { appointmentDate?: { greater_than_equal?: string } }) =>
            condition.appointmentDate?.greater_than_equal,
        )?.appointmentDate?.greater_than_equal

        return {
          docs: startDate
            ? existingAppointments.filter((item) => item.appointmentDate >= startDate)
            : existingAppointments,
        }
      }),
    },
  }

  const result = await applyAppointmentLoyalty({
    data,
    req,
  } as never)

  return { result, req }
}

describe('loyalty helpers', () => {
  it('uses service countsTowardLoyalty instead of service name matching', () => {
    expect(
      appointmentHasLoyaltyService([
        service({ name: 'Herreklipp', countsTowardLoyalty: false }),
        service({ name: 'Skjeggtrim', countsTowardLoyalty: true }),
      ]),
    ).toBe(true)
  })

  it('makes only the cheapest loyalty service free', () => {
    const eligibleExpensive = service({ id: 'klipp', name: 'Herreklipp', price: 450 })
    const eligibleCheap = service({ id: 'fade', name: 'Skin-fade', price: 350 })
    const ineligible = service({
      id: 'beard',
      name: 'Skjeggtrim',
      price: 250,
      countsTowardLoyalty: false,
    })

    const pricing = getLoyaltyPricing(
      appointment({ loyalty: { isFree: true, qualifyingCount: 10, progressCount: 10 } }),
      [eligibleExpensive, eligibleCheap, ineligible],
    )

    expect(pricing.freeService?.id).toBe('fade')
    expect(pricing.discount).toBe(350)
    expect(pricing.totalPrice).toBe(700)
  })

  it('normalizes customer email before lookup/storage', () => {
    expect(normalizeEmail(' Test@Email.NO ')).toBe('test@email.no')
  })
})

describe('applyAppointmentLoyalty', () => {
  it('carries progress across years within the same 12-month cycle', async () => {
    const existingAppointments = [
      ...previousAppointments(6, { year: 2026 }),
      ...previousAppointments(3, { year: 2027 }).map((item, index) => ({
        ...item,
        appointmentDate: `2027-0${index + 1}-01T00:00:00.000Z`,
      })),
    ]

    const { result } = await applyLoyalty({
      data: {
        customer: 'customer-1',
        service: ['service-1'],
        appointmentDate: '2027-04-01T00:00:00.000Z',
        status: 'confirmed',
      },
      existingAppointments,
    })

    expect(result.loyalty).toEqual({
      isFree: true,
      qualifyingCount: 10,
      progressCount: 10,
    })
  })

  it('ignores appointments before the loyalty start date', async () => {
    const existingAppointments = previousAppointments(7, { year: 2026 }).map((item, index) => ({
      ...item,
      appointmentDate: `2026-06-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
    }))

    const { result } = await applyLoyalty({
      data: {
        customer: 'customer-1',
        service: ['service-1'],
        appointmentDate: '2026-06-08T00:00:00.000Z',
        status: 'confirmed',
      },
      existingAppointments,
    })

    expect(result.loyalty).toEqual({
      isFree: false,
      qualifyingCount: 1,
      progressCount: 1,
    })
  })

  it('does not give a second free reward in the same 12-month cycle', async () => {
    const existingAppointments = previousAppointments(19, { year: 2027, freeAt: [10] })

    const { result } = await applyLoyalty({
      data: {
        customer: 'customer-1',
        service: ['service-1'],
        appointmentDate: '2027-12-01T00:00:00.000Z',
        status: 'confirmed',
      },
      existingAppointments,
    })

    expect(result.loyalty).toEqual({
      isFree: false,
      qualifyingCount: 20,
      progressCount: 10,
    })
  })

  it('keeps later bookings in the same cycle at 10 of 10', async () => {
    const existingAppointments = previousAppointments(20, { year: 2027, freeAt: [10] })

    const { result } = await applyLoyalty({
      data: {
        customer: 'customer-1',
        service: ['service-1'],
        appointmentDate: '2028-01-15T00:00:00.000Z',
        status: 'confirmed',
      },
      existingAppointments,
    })

    expect(result.loyalty).toEqual({
      isFree: false,
      qualifyingCount: 21,
      progressCount: 10,
    })
  })

  it('starts a new cycle with the first booking after the previous cycle ends', async () => {
    const existingAppointments = previousAppointments(10, { year: 2026, freeAt: [10] }).map(
      (item, index) => ({
        ...item,
        appointmentDate: `2026-07-${String(index + 10).padStart(2, '0')}T00:00:00.000Z`,
      }),
    )

    const { result } = await applyLoyalty({
      data: {
        customer: 'customer-1',
        service: ['service-1'],
        appointmentDate: '2027-07-10T00:00:00.000Z',
        status: 'confirmed',
      },
      existingAppointments,
    })

    expect(result.loyalty).toEqual({
      isFree: false,
      qualifyingCount: 1,
      progressCount: 1,
    })
  })

  it('does not count services that are not loyalty eligible', async () => {
    const { result } = await applyLoyalty({
      data: {
        customer: 'customer-1',
        service: ['service-1'],
        appointmentDate: '2027-04-01T00:00:00.000Z',
        status: 'confirmed',
      },
      existingAppointments: previousAppointments(9),
      services: [service({ id: 'service-1', countsTowardLoyalty: false })],
    })

    expect(result.loyalty).toEqual({
      isFree: false,
      qualifyingCount: 0,
      progressCount: 0,
    })
  })

  it('resets loyalty state when an appointment is cancelled', async () => {
    const { result } = await applyLoyalty({
      data: {
        customer: 'customer-1',
        service: ['service-1'],
        appointmentDate: '2027-04-01T00:00:00.000Z',
        status: 'cancelled',
      },
      existingAppointments: previousAppointments(9),
    })

    expect(result.loyalty).toEqual({
      isFree: false,
      qualifyingCount: 0,
      progressCount: 0,
    })
  })
})
