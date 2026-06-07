import type { Appointment, Service } from '@/payload-types'

export const LOYALTY_REQUIRED_APPOINTMENTS = 10

export function isLoyaltyService(service: Pick<Service, 'countsTowardLoyalty'>): boolean {
  return Boolean(service.countsTowardLoyalty)
}

export function appointmentHasLoyaltyService(
  services: Pick<Service, 'countsTowardLoyalty'>[],
): boolean {
  return services.some(isLoyaltyService)
}

export function getLoyaltyProgressFromCount(qualifyingCount: number): number {
  if (qualifyingCount <= 0) return 0

  const progress = qualifyingCount % LOYALTY_REQUIRED_APPOINTMENTS
  return progress === 0 ? LOYALTY_REQUIRED_APPOINTMENTS : progress
}

export function getAppointmentLoyalty(appointment: Appointment) {
  const loyalty = appointment.loyalty

  return {
    isFree: Boolean(loyalty?.isFree),
    qualifyingCount: loyalty?.qualifyingCount ?? 0,
    progressCount: loyalty?.progressCount ?? 0,
  }
}

export function getLoyaltyPricing(appointment: Appointment, services: Service[]) {
  const originalPrice = services.reduce((sum, service) => sum + service.price, 0)
  const loyalty = getAppointmentLoyalty(appointment)

  if (!loyalty.isFree) {
    return {
      originalPrice,
      discount: 0,
      totalPrice: originalPrice,
      freeService: null,
    }
  }

  const freeService = services.filter(isLoyaltyService).sort((a, b) => a.price - b.price)[0] ?? null
  const discount = freeService?.price ?? 0

  return {
    originalPrice,
    discount,
    totalPrice: Math.max(originalPrice - discount, 0),
    freeService,
  }
}
