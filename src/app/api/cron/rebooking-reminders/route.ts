import config from '@/payload.config'
import { getNowInAppointmentTimezone, toAppointmentDateKey } from '@/lib/appointmentDate'
import { sendRebookingReminder, validateEmailData } from '@/email/services'
import type { Appointment, Customer, Service, Worker } from '@/payload-types'
import { getPayload } from 'payload'

export const runtime = 'nodejs'

const DEFAULT_DAY_OFFSET = 30
const MAX_LIMIT = 200

function isAuthorized(request: Request): boolean {
  const configuredSecret = process.env.CRON_SECRET || process.env.CRON_API_KEY

  if (!configuredSecret) {
    return false
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.slice('Bearer '.length).trim()
  return token === configuredSecret
}

function parseNonNegativeInt(value: string | null, fallbackValue: number): number {
  if (!value) {
    return fallbackValue
  }

  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallbackValue
  }

  return parsed
}

function subtractDaysFromDateKey(dateKey: string, daysToSubtract: number): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day - daysToSubtract, 12, 0, 0, 0))
  return toAppointmentDateKey(date)
}

function isValidDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export async function GET(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const { searchParams } = new URL(request.url)
  const dayOffset = parseNonNegativeInt(searchParams.get('dayOffset'), DEFAULT_DAY_OFFSET)
  const targetDateParam = searchParams.get('targetDate')

  const todayInTimezone = getNowInAppointmentTimezone().date
  const targetDateKey =
    targetDateParam && isValidDateKey(targetDateParam)
      ? targetDateParam
      : subtractDaysFromDateKey(todayInTimezone, dayOffset)

  let page = 1
  let hasNextPage = true

  const stats = {
    scanned: 0,
    sent: 0,
    failed: 0,
    skippedAlreadySent: 0,
    skippedInvalidData: 0,
  }

  while (hasNextPage) {
    const result = await payload.find({
      collection: 'appointments',
      where: {
        and: [
          {
            status: {
              in: ['confirmed', 'completed'],
            },
          },
          { sendEmails: { equals: true } },
          {
            appointmentDate: {
              greater_than_equal: `${targetDateKey}T00:00:00.000Z`,
              less_than_equal: `${targetDateKey}T23:59:59.999Z`,
            },
          },
        ],
      },
      depth: 2,
      limit: MAX_LIMIT,
      page,
      sort: 'appointmentDate',
    })

    for (const appointment of result.docs as Appointment[]) {
      stats.scanned += 1

      if (appointment.emailsSent?.rebookingReminderSent) {
        stats.skippedAlreadySent += 1
        continue
      }

      const customer = appointment.customer as Customer
      const worker = appointment.worker as Worker
      const services = Array.isArray(appointment.service)
        ? (appointment.service as Service[])
        : [appointment.service as Service]

      if (!validateEmailData(customer, services, worker)) {
        stats.skippedInvalidData += 1
        continue
      }

      const sendResult = await sendRebookingReminder(payload, appointment, customer, services, worker)

      if (!sendResult.success) {
        stats.failed += 1
        continue
      }

      await payload.update({
        collection: 'appointments',
        id: appointment.id,
        data: {
          emailsSent: {
            ...appointment.emailsSent,
            rebookingReminderSent: true,
            rebookingReminderSentAt: new Date().toISOString(),
          },
        },
        context: { skipEmails: true },
      })

      stats.sent += 1
    }

    hasNextPage = result.hasNextPage
    page += 1
  }

  return Response.json({
    success: true,
    targetDateKey,
    dayOffset,
    stats,
  })
}
