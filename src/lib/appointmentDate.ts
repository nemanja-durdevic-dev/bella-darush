const APPOINTMENT_TIMEZONE = 'Europe/Oslo'

type DateParts = {
  year: number
  month: number
  day: number
}

function parseDateParts(dateInput: string | Date): DateParts {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid appointment date value: ${String(dateInput)}`)
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: APPOINTMENT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(date)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)

  if (!year || !month || !day) {
    throw new Error('Unable to parse appointment date parts')
  }

  return { year, month, day }
}

export function toAppointmentDateKey(dateInput: string | Date): string {
  const { year, month, day } = parseDateParts(dateInput)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function toAdminDayOnlyISOString(dateKey: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new Error(`Invalid date key format: ${dateKey}`)
  }

  return `${dateKey}T12:00:00.000Z`
}

export function formatAppointmentDateNorwegian(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)

  if (Number.isNaN(date.getTime())) {
    return String(dateInput)
  }

  const formattedDate = new Intl.DateTimeFormat('nb-NO', {
    timeZone: APPOINTMENT_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)

  return formattedDate.replace(/\p{L}[\p{L}\p{M}]*/gu, (word) => {
    return word.charAt(0).toLocaleUpperCase('nb-NO') + word.slice(1)
  })
}

export function getNowInAppointmentTimezone(): { date: string; time: string } {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: APPOINTMENT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(now)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  const hour = parts.find((part) => part.type === 'hour')?.value
  const minute = parts.find((part) => part.type === 'minute')?.value

  if (!year || !month || !day || !hour || !minute) {
    throw new Error('Unable to read current time in appointment timezone')
  }

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  }
}

function parseTimeParts(timeValue: string): { hours: number; minutes: number } | null {
  const match = timeValue.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])

  return { hours, minutes }
}

function toComparableTimestamp(dateInput: string | Date, timeValue: string): number | null {
  const dateKey = toAppointmentDateKey(dateInput)
  const timeParts = parseTimeParts(timeValue)

  if (!timeParts) {
    return null
  }

  const [year, month, day] = dateKey.split('-').map(Number)

  return Date.UTC(year, month - 1, day, timeParts.hours, timeParts.minutes, 0, 0)
}

export function getMinutesUntilAppointmentStart(
  dateInput: string | Date,
  timeValue: string,
): number | null {
  const appointmentTimestamp = toComparableTimestamp(dateInput, timeValue)
  if (appointmentTimestamp === null) {
    return null
  }

  const nowInTimezone = getNowInAppointmentTimezone()
  const nowTimestamp = toComparableTimestamp(nowInTimezone.date, nowInTimezone.time)
  if (nowTimestamp === null) {
    return null
  }

  return Math.floor((appointmentTimestamp - nowTimestamp) / 60000)
}
