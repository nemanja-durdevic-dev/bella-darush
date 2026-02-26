import type { Service, Worker } from '@/payload-types'

/**
 * Server Action return types for form submissions
 */
export type ActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

export type AppointmentActionResult = ActionResult<{
  appointmentId: string
}>

/**
 * Component prop types
 */
export interface BookingSummaryProps {
  services: Service[]
  worker: Worker
  date: string
  time: string
}

export interface TimeSlotGridProps {
  serviceIds: string[]
  selectedWorkerId?: string
  workers: Array<{ id: string; name: string; imageUrl?: string; description?: string | null }>
  weekSlots: Array<{ day: string; timeslots: string[] }>
  slotWorkerMap: Record<string, string>
  totalPrice: number
}

/**
 * Time slot filtering function type
 */
export interface GetAvailableTimeSlotsParams {
  workerId: string
  serviceIds: string[]
  date: string
  currentTime?: string
}

export interface CustomerFormProps {
  serviceIds: string[]
  workerId: string
  date: string
  time: string
}

/**
 * Step navigation types
 */
export type AppointmentStep = 'service' | 'datetime' | 'confirm' | 'success'

export interface StepConfig {
  step: AppointmentStep
  title: string
  number: number
}
