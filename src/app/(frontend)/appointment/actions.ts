'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { customerInfoSchema, confirmStepSchema } from './validation'
import type { AppointmentActionResult } from './types'
import {
  getNowInAppointmentTimezone,
  toAdminDayOnlyISOString,
  toAppointmentDateKey,
} from '@/lib/appointmentDate'

const TIMESLOT_INTERVAL_MINUTES = 15

/**
 * Get all active services
 */
export async function getServices() {
  const payload = await getPayload({ config })
  const services = await payload.find({
    collection: 'services',
    where: { isActive: { equals: true } },
    depth: 1,
    sort: 'name',
    limit: 100,
  })
  return services.docs
}

/**
 * Get active service groups with services ordered inside each group
 */
export async function getServiceGroupsForBooking() {
  const payload = await getPayload({ config })

  const groups = await payload.find({
    collection: 'service-groups',
    where: { isActive: { equals: true } },
    sort: 'sortOrder',
    depth: 1,
    limit: 100,
  })

  return groups.docs
}

/**
 * Get a single service by ID
 */
export async function getServiceById(id: string) {
  try {
    const payload = await getPayload({ config })
    const service = await payload.findByID({
      collection: 'services',
      id,
    })
    return service
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}

/**
 * Get services by IDs
 */
export async function getServicesByIds(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)))
  if (uniqueIds.length === 0) {
    return []
  }

  const payload = await getPayload({ config })
  const services = await payload.find({
    collection: 'services',
    where: {
      id: {
        in: uniqueIds,
      },
    },
    limit: uniqueIds.length,
  })

  return services.docs
}

/**
 * Get workers available for a specific service
 */
export async function getWorkersForService(serviceId: string) {
  return getWorkersForServices([serviceId])
}

type NextAvailableServiceSlot = {
  day: string
  time: string
}

/**
 * Get the next available appointment slot for each service ID
 */
export async function getNextAvailableSlotsForServices(
  serviceIds: string[],
): Promise<Record<string, NextAvailableServiceSlot | null>> {
  const uniqueServiceIds = Array.from(new Set(serviceIds.filter(Boolean)))

  if (uniqueServiceIds.length === 0) {
    return {}
  }

  const nowInTimezone = getNowInAppointmentTimezone()

  const entries = await Promise.all(
    uniqueServiceIds.map(async (serviceId) => {
      const workers = await getWorkersForService(serviceId)

      if (workers.length === 0) {
        return [serviceId, null] as const
      }

      const weekSlotsByWorker = await Promise.all(
        workers.map((worker) =>
          getAvailableTimeSlotsForNext9Days(
            String(worker.id),
            [serviceId],
            nowInTimezone.date,
            nowInTimezone.time,
          ),
        ),
      )

      let earliestSlot: NextAvailableServiceSlot | null = null

      for (const weekSlots of weekSlotsByWorker) {
        for (const daySlot of weekSlots) {
          for (const time of daySlot.timeslots) {
            if (
              !earliestSlot ||
              `${daySlot.day}T${time}` < `${earliestSlot.day}T${earliestSlot.time}`
            ) {
              earliestSlot = { day: daySlot.day, time }
            }
          }
        }
      }

      return [serviceId, earliestSlot] as const
    }),
  )

  return Object.fromEntries(entries)
}

/**
 * Get workers available for all selected services
 */
export async function getWorkersForServices(serviceIds: string[]) {
  const payload = await getPayload({ config })

  const uniqueServiceIds = Array.from(new Set(serviceIds.filter(Boolean)))

  if (uniqueServiceIds.length === 0) {
    return []
  }

  const workers = await payload.find({
    collection: 'workers',
    where: {
      isActive: { equals: true },
    },
    sort: 'name',
    limit: 100,
  })

  return workers.docs.filter((worker) => {
    const workerServiceIds = new Set(
      (worker.services ?? []).map((service) =>
        typeof service === 'string' || typeof service === 'number'
          ? String(service)
          : String(service.id),
      ),
    )

    return uniqueServiceIds.every((serviceId) => workerServiceIds.has(serviceId))
  })
}

/**
 * Get a single worker by ID
 */
export async function getWorkerById(id: string) {
  try {
    const payload = await getPayload({ config })
    const worker = await payload.findByID({
      collection: 'workers',
      id,
    })
    return worker
  } catch (error) {
    console.error('Error fetching worker:', error)
    return null
  }
}

/**
 * Get available time slots for a worker on a specific date
 */
export async function getAvailableTimeSlots(
  workerId: string,
  serviceIds: string[],
  date: string,
  currentTime?: string,
): Promise<string[]> {
  const payload = await getPayload({ config })

  // Get the worker's working hours
  const worker = await payload.findByID({
    collection: 'workers',
    id: workerId,
  })

  const selectedServices = await getServicesByIds(serviceIds)
  const selectedServiceDuration = selectedServices.reduce(
    (sum, service) => sum + (service.duration ?? 0),
    0,
  )

  if (!worker || selectedServices.length === 0 || selectedServiceDuration <= 0) {
    return []
  }

  // Get day of week from date
  const dateObj = new Date(date)
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayOfWeek = days[dateObj.getDay()]

  // Check for schedule override
  const { startOfDay, endOfDay } = getLocalDayRange(date)
  const override = await payload.find({
    collection: 'schedule-overrides',
    where: {
      and: [{ date: { greater_than_equal: startOfDay } }, { date: { less_than_equal: endOfDay } }],
    },
    sort: '-createdAt',
    limit: 1,
  })

  let isClosed = false
  let baseRanges: Array<{ start: string; end: string }> = []

  if (override.docs.length > 0) {
    const overrideDoc = override.docs[0]
    isClosed = overrideDoc.isClosed ?? false
    if (!isClosed && Array.isArray(overrideDoc.timeRanges) && overrideDoc.timeRanges.length > 0) {
      baseRanges = overrideDoc.timeRanges
        .filter((range) => range?.startTime && range?.endTime)
        .map((range) => ({
          start: range.startTime as string,
          end: range.endTime as string,
        }))
    } else if (!isClosed && overrideDoc.openTime && overrideDoc.closeTime) {
      baseRanges = [{ start: overrideDoc.openTime, end: overrideDoc.closeTime }]
    }
  } else {
    // Get business hours for this day
    const businessHours = await payload.find({
      collection: 'business-hours',
      where: {
        dayOfWeek: { equals: dayOfWeek },
      },
      limit: 1,
    })

    if (businessHours.docs.length > 0) {
      const hours = businessHours.docs[0]
      isClosed = hours.isClosed ?? false
      if (!isClosed && hours.openTime && hours.closeTime) {
        baseRanges = [{ start: hours.openTime, end: hours.closeTime }]
      }
    }
  }

  if (isClosed || baseRanges.length === 0) {
    return []
  }

  // Find worker's hours for this day
  const workerHours = worker.workingHours?.find(
    (wh: { dayOfWeek?: string }) => wh.dayOfWeek === dayOfWeek,
  )

  if (!workerHours) {
    return []
  }

  // Calculate effective hours (intersection of base ranges and worker hours)
  const effectiveRanges = baseRanges
    .map((range) => ({
      start: maxTime(range.start, workerHours.startTime),
      end: minTime(range.end, workerHours.endTime),
    }))
    .filter((range) => timeToMinutes(range.start) < timeToMinutes(range.end))

  if (effectiveRanges.length === 0) {
    return []
  }

  // Get existing appointments for this worker on this date
  // Use a date range because Postgres stores date fields with time
  const { startOfDay: appointmentStartOfDay, endOfDay: appointmentEndOfDay } =
    getLocalDayRange(date)

  const existingAppointments = await payload.find({
    collection: 'appointments',
    where: {
      and: [
        { worker: { equals: workerId } },
        {
          appointmentDate: {
            greater_than_equal: appointmentStartOfDay,
            less_than_equal: appointmentEndOfDay,
          },
        },
        { status: { not_in: ['cancelled'] } },
      ],
    },
    limit: 100,
  })

  const bookedServiceIds = Array.from(
    new Set(
      existingAppointments.docs.flatMap((appointment) =>
        getServiceIdsFromValue(appointment.service),
      ),
    ),
  )
  const bookedServiceDurationMap = await getServiceDurationMap(payload, bookedServiceIds)

  // Build a set of booked time ranges
  const bookedRanges: { start: number; end: number }[] = []
  for (const appointment of existingAppointments.docs) {
    const appointmentStart = timeToMinutes(appointment.appointmentTime)
    const bookedDuration = getTotalDurationForServiceIds(
      getServiceIdsFromValue(appointment.service),
      bookedServiceDurationMap,
      30,
    )
    bookedRanges.push({ start: appointmentStart, end: appointmentStart + bookedDuration })
  }

  // Generate time slots in 15-minute intervals
  const slots: string[] = []
  const duration = selectedServiceDuration

  // Filter out past slots if we have current time and the date is today
  const isToday = date === getTodayLocalDate()
  const currentTimeMinutes = currentTime ? timeToMinutes(currentTime) : undefined
  const minStartTime = isToday && currentTimeMinutes ? currentTimeMinutes + 30 : 0 // 30-minute buffer

  for (const range of effectiveRanges) {
    let slotTime = timeToMinutes(range.start)
    const endTime = timeToMinutes(range.end)

    while (slotTime + duration <= endTime) {
      const slotEnd = slotTime + duration

      // Skip slots that are in the past (with 30-minute buffer for today)
      if (slotTime < minStartTime) {
        slotTime += TIMESLOT_INTERVAL_MINUTES
        continue
      }

      // Check if this slot overlaps with any existing appointment
      const isOverlapping = bookedRanges.some(
        (booked) => slotTime < booked.end && slotEnd > booked.start,
      )

      if (!isOverlapping) {
        slots.push(minutesToTime(slotTime))
      }

      // Move to next interval
      slotTime += TIMESLOT_INTERVAL_MINUTES
    }
  }

  return slots
}

/**
 * Get available time slots for 9 days from current day
 */
export async function getAvailableTimeSlotsForNext9Days(
  workerId: string,
  serviceIds: string[],
  date: string,
  currentTime?: string,
): Promise<{ day: string; timeslots: string[] }[]> {
  const payload = await getPayload({ config })

  // Fetch worker and selected services once
  const [worker, selectedServices] = await Promise.all([
    payload.findByID({ collection: 'workers', id: workerId }),
    getServicesByIds(serviceIds),
  ])

  const selectedServiceDuration = selectedServices.reduce(
    (sum, service) => sum + (service.duration ?? 0),
    0,
  )

  if (!worker || selectedServices.length === 0 || selectedServiceDuration <= 0) {
    return []
  }

  // Calculate 9-day rolling range from current day
  const today = getTodayLocalDate()
  const [year, month, day] = today.split('-').map(Number)
  const startDate = new Date(year, month - 1, day)
  const endDate = addDays(startDate, 8)

  const rangeStartStr = formatLocalDate(startDate)
  const rangeEndStr = formatLocalDate(endDate)

  const { startOfDay: rangeStartOfDay } = getLocalDayRange(rangeStartStr)
  const { endOfDay: rangeEndOfDay } = getLocalDayRange(rangeEndStr)

  // Fetch business hours, schedule overrides, and appointments for the full 9-day range
  const [businessHours, overrides, existingAppointments] = await Promise.all([
    payload.find({
      collection: 'business-hours',
      limit: 7,
    }),
    payload.find({
      collection: 'schedule-overrides',
      where: {
        and: [
          { date: { greater_than_equal: rangeStartOfDay } },
          { date: { less_than_equal: rangeEndOfDay } },
        ],
      },
      sort: '-createdAt',
      limit: 100,
    }),
    payload.find({
      collection: 'appointments',
      where: {
        and: [
          { worker: { equals: workerId } },
          {
            appointmentDate: {
              greater_than_equal: rangeStartOfDay,
              less_than_equal: rangeEndOfDay,
            },
          },
          { status: { not_in: ['cancelled'] } },
        ],
      },
      limit: 1000,
    }),
  ])

  // Create lookup maps
  const businessHoursMap = new Map(businessHours.docs.map((bh) => [bh.dayOfWeek, bh]))

  const overridesMap = new Map<string, (typeof overrides.docs)[0]>()
  for (const override of overrides.docs) {
    const overrideDate = new Date(override.date).toISOString().split('T')[0]
    overridesMap.set(overrideDate, override)
  }

  // Group appointments by date
  const appointmentsByDate = new Map<string, typeof existingAppointments.docs>()
  for (const appointment of existingAppointments.docs) {
    const apptDateObj = new Date(appointment.appointmentDate)
    const apptDate = formatLocalDate(apptDateObj)
    if (!appointmentsByDate.has(apptDate)) {
      appointmentsByDate.set(apptDate, [])
    }
    appointmentsByDate.get(apptDate)!.push(appointment)
  }

  const allBookedServiceIds = Array.from(
    new Set(
      existingAppointments.docs.flatMap((appointment) =>
        getServiceIdsFromValue(appointment.service),
      ),
    ),
  )
  const bookedServiceDurationMap = await getServiceDurationMap(payload, allBookedServiceIds)

  const days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ] as const
  const currentTimeMinutes = currentTime ? timeToMinutes(currentTime) : undefined

  // Process each day
  const result: { day: string; timeslots: string[] }[] = []

  for (let i = 0; i < 9; i++) {
    const currentDate = addDays(startDate, i)
    const dateStr = formatLocalDate(currentDate)
    const dayOfWeek = days[currentDate.getDay()]

    // Get base ranges from override or business hours
    let isClosed = false
    let baseRanges: Array<{ start: string; end: string }> = []

    const override = overridesMap.get(dateStr)
    if (override) {
      isClosed = override.isClosed ?? false
      if (!isClosed && Array.isArray(override.timeRanges) && override.timeRanges.length > 0) {
        baseRanges = override.timeRanges
          .filter((range) => range?.startTime && range?.endTime)
          .map((range) => ({
            start: range.startTime as string,
            end: range.endTime as string,
          }))
      } else if (!isClosed && override.openTime && override.closeTime) {
        baseRanges = [{ start: override.openTime, end: override.closeTime }]
      }
    } else {
      const hours = businessHoursMap.get(dayOfWeek)
      if (hours) {
        isClosed = hours.isClosed ?? false
        if (!isClosed && hours.openTime && hours.closeTime) {
          baseRanges = [{ start: hours.openTime, end: hours.closeTime }]
        }
      }
    }

    if (isClosed || baseRanges.length === 0) {
      result.push({ day: dateStr, timeslots: [] })
      continue
    }

    // Find worker's hours for this day
    const workerHours = worker.workingHours?.find(
      (wh: { dayOfWeek?: string }) => wh.dayOfWeek === dayOfWeek,
    )

    if (!workerHours) {
      result.push({ day: dateStr, timeslots: [] })
      continue
    }

    // Calculate effective hours
    const effectiveRanges = baseRanges
      .map((range) => ({
        start: maxTime(range.start, workerHours.startTime),
        end: minTime(range.end, workerHours.endTime),
      }))
      .filter((range) => timeToMinutes(range.start) < timeToMinutes(range.end))

    if (effectiveRanges.length === 0) {
      result.push({ day: dateStr, timeslots: [] })
      continue
    }

    // Build booked ranges for this day
    const bookedRanges: { start: number; end: number }[] = []
    const dayAppointments = appointmentsByDate.get(dateStr) || []

    for (const appointment of dayAppointments) {
      const appointmentStart = timeToMinutes(appointment.appointmentTime)
      const bookedDuration = getTotalDurationForServiceIds(
        getServiceIdsFromValue(appointment.service),
        bookedServiceDurationMap,
        30,
      )
      bookedRanges.push({ start: appointmentStart, end: appointmentStart + bookedDuration })
    }

    // Generate time slots in 15-minute intervals
    const slots: string[] = []
    const duration = selectedServiceDuration
    const isToday = dateStr === today
    const minStartTime = isToday && currentTimeMinutes ? currentTimeMinutes + 30 : 0

    for (const range of effectiveRanges) {
      let slotTime = timeToMinutes(range.start)
      const endTime = timeToMinutes(range.end)

      while (slotTime + duration <= endTime) {
        const slotEnd = slotTime + duration

        if (slotTime < minStartTime) {
          slotTime += TIMESLOT_INTERVAL_MINUTES
          continue
        }

        const isOverlapping = bookedRanges.some(
          (booked) => slotTime < booked.end && slotEnd > booked.start,
        )

        if (!isOverlapping) {
          slots.push(minutesToTime(slotTime))
        }

        slotTime += TIMESLOT_INTERVAL_MINUTES
      }
    }

    result.push({ day: dateStr, timeslots: slots })
  }

  return result
}

/**
 * Create an appointment with validation
 */
export async function createAppointment(
  prevState: AppointmentActionResult,
  formData: FormData,
): Promise<AppointmentActionResult> {
  try {
    const payload = await getPayload({ config })

    // Extract all form data
    const rawData = {
      serviceIds: formData.getAll('service').map(String).filter(Boolean),
      worker: formData.get('worker') as string,
      date: formData.get('appointmentDate') as string,
      time: formData.get('appointmentTime') as string,
      customerName: formData.get('customerName') as string,
      customerEmail: formData.get('customerEmail') as string,
      customerPhone: formData.get('customerPhone') as string,
      notes: (formData.get('notes') as string) || undefined,
    }

    // Validate appointment details
    const appointmentValidation = confirmStepSchema.safeParse({
      service: rawData.serviceIds,
      worker: rawData.worker,
      date: rawData.date,
      time: rawData.time,
    })

    if (!appointmentValidation.success) {
      const errors = appointmentValidation.error.issues.map((e) => e.message).join(', ')
      return { success: false, error: errors }
    }

    const nowInTimezone = getNowInAppointmentTimezone()
    const appointmentHasPassed =
      rawData.date < nowInTimezone.date ||
      (rawData.date === nowInTimezone.date && rawData.time < nowInTimezone.time)

    if (appointmentHasPassed) {
      return {
        success: false,
        error: 'Valgt tidspunkt er i fortiden. Velg et nytt tidspunkt.',
      }
    }

    // Validate customer information
    const customerValidation = customerInfoSchema.safeParse({
      customerName: rawData.customerName,
      customerEmail: rawData.customerEmail,
      customerPhone: rawData.customerPhone,
      notes: rawData.notes,
    })

    if (!customerValidation.success) {
      const errors = customerValidation.error.issues.map((e) => e.message).join(', ')
      return { success: false, error: errors }
    }

    const { customerName, customerEmail, customerPhone, notes } = customerValidation.data

    // Find or create customer
    const existingCustomer = await payload.find({
      collection: 'customers',
      where: { email: { equals: customerEmail } },
      limit: 1,
    })

    let customerId: string

    if (existingCustomer.docs.length > 0) {
      customerId = existingCustomer.docs[0].id
      // Update customer info if changed
      await payload.update({
        collection: 'customers',
        id: customerId,
        data: {
          name: customerName,
          phone: customerPhone,
        },
      })
    } else {
      // Create new customer
      const newCustomer = await payload.create({
        collection: 'customers',
        data: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
      })
      customerId = newCustomer.id
    }

    // Create the appointment
    const appointment = await payload.create({
      collection: 'appointments',
      data: {
        customer: customerId,
        service: rawData.serviceIds,
        worker: rawData.worker,
        appointmentDate: toAdminDayOnlyISOString(rawData.date),
        appointmentTime: rawData.time,
        notes: notes || undefined,
        status: 'confirmed',
      },
    })

    return {
      success: true,
      data: { appointmentId: appointment.id },
    }
  } catch (error) {
    console.error('Appointment creation error:', error)
    const message = error instanceof Error ? error.message : 'Kunne ikke opprette bestilling'
    return { success: false, error: message }
  }
}

/**
 * Get appointment by ID (for success page)
 */
export async function getAppointmentById(id: string) {
  try {
    const payload = await getPayload({ config })
    const appointment = await payload.findByID({
      collection: 'appointments',
      id,
      depth: 2, // Populate service and worker
    })
    return appointment
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return null
  }
}

// Helper functions
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function maxTime(a: string, b: string): string {
  return timeToMinutes(a) > timeToMinutes(b) ? a : b
}

function minTime(a: string, b: string): string {
  return timeToMinutes(a) < timeToMinutes(b) ? a : b
}

function getLocalDayRange(date: string): { startOfDay: string; endOfDay: string } {
  const [year, month, day] = date.split('-').map(Number)
  const start = new Date(year, month - 1, day, 0, 0, 0, 0)
  const end = new Date(year, month - 1, day, 23, 59, 59, 999)
  return { startOfDay: start.toISOString(), endOfDay: end.toISOString() }
}

function getStartOfWeek(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const dayOfWeek = d.getDay() // 0=Sunday, 1=Monday
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getTodayLocalDate(): string {
  return formatLocalDate(new Date())
}

function getServiceIdsFromValue(serviceValue: unknown): string[] {
  if (Array.isArray(serviceValue)) {
    return serviceValue
      .map((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
          return String(item)
        }
        if (item && typeof item === 'object' && 'id' in item) {
          return String(item.id)
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

async function getServiceDurationMap(
  payload: Awaited<ReturnType<typeof getPayload>>,
  serviceIds: string[],
): Promise<Map<string, number>> {
  const uniqueIds = Array.from(new Set(serviceIds.filter(Boolean)))
  const map = new Map<string, number>()

  if (uniqueIds.length === 0) {
    return map
  }

  const { docs } = await payload.find({
    collection: 'services',
    where: {
      id: {
        in: uniqueIds,
      },
    },
    limit: uniqueIds.length,
  })

  for (const service of docs) {
    map.set(service.id, service.duration ?? 0)
  }

  return map
}

function getTotalDurationForServiceIds(
  serviceIds: string[],
  durationMap: Map<string, number>,
  fallbackDuration: number,
): number {
  if (serviceIds.length === 0) {
    return fallbackDuration
  }

  const duration = serviceIds.reduce((sum, serviceId) => sum + (durationMap.get(serviceId) ?? 0), 0)

  return duration > 0 ? duration : fallbackDuration
}

/**
 * Get appointment by cancellation token
 */
export async function getAppointmentByToken(token: string) {
  try {
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'appointments',
      where: {
        cancellationToken: {
          equals: token,
        },
      },
      depth: 2, // Populate all relationships
      limit: 1,
    })

    if (docs.length === 0) {
      return { success: false, error: 'Invalid or expired cancellation link' }
    }

    return { success: true, appointment: docs[0] }
  } catch (error) {
    console.error('Error fetching appointment by token:', error)
    return { success: false, error: 'Failed to fetch appointment' }
  }
}

/**
 * Cancel appointment by token
 */
export async function cancelAppointmentByToken(token: string) {
  try {
    const payload = await getPayload({ config })

    // First, find the appointment by token
    const { docs } = await payload.find({
      collection: 'appointments',
      where: {
        cancellationToken: {
          equals: token,
        },
      },
      limit: 1,
    })

    if (docs.length === 0) {
      return { success: false, error: 'Invalid or expired cancellation link' }
    }

    const appointment = docs[0]

    // Check if already cancelled
    if (appointment.status === 'cancelled') {
      return {
        success: false,
        error: 'already_cancelled',
        appointment,
      }
    }

    // Check if appointment is in the past
    const appointmentDateKey = toAppointmentDateKey(appointment.appointmentDate)
    const nowInTimezone = getNowInAppointmentTimezone()

    const appointmentHasPassed =
      appointmentDateKey < nowInTimezone.date ||
      (appointmentDateKey === nowInTimezone.date &&
        appointment.appointmentTime < nowInTimezone.time)

    if (appointmentHasPassed) {
      return {
        success: false,
        error: 'appointment_passed',
        appointment,
      }
    }

    // Update appointment status to cancelled
    const updatedAppointment = await payload.update({
      collection: 'appointments',
      id: appointment.id,
      data: {
        status: 'cancelled',
      },
      depth: 2, // Return with all relationships populated
    })

    console.log(`✅ Appointment ${appointment.id} cancelled by customer via token`)

    return {
      success: true,
      appointment: updatedAppointment,
    }
  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return {
      success: false,
      error: 'Failed to cancel appointment. Please try again or contact us.',
    }
  }
}
