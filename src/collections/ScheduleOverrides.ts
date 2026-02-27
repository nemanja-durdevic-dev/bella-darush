import type { CollectionConfig } from 'payload'

const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

const validateTimeValue = (value: string | null | undefined) => {
  if (!value) return true
  if (!timeRegex.test(value)) {
    return 'Please enter a valid time in HH:MM format (e.g., 10:00)'
  }
  return true
}

const validateTimeRanges = (
  value: unknown[] | null | undefined,
  { siblingData }: { siblingData: Record<string, unknown> },
) => {
  if (siblingData?.isClosed) return true
  if (!value || value.length === 0) return true

  const ranges = value
    .filter((range): range is { startTime?: string; endTime?: string } => {
      return typeof range === 'object' && range !== null
    })
    .map((range) => ({
      startTime: range.startTime,
      endTime: range.endTime,
    }))

  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  for (const range of ranges) {
    if (!range.startTime || !range.endTime) {
      return 'Each time range must include a start and end time'
    }
    if (!timeRegex.test(range.startTime) || !timeRegex.test(range.endTime)) {
      return 'Each time range must be in HH:MM format'
    }
    if (toMinutes(range.startTime) >= toMinutes(range.endTime)) {
      return 'Each time range must end after it starts'
    }
  }

  const sorted = ranges
    .slice()
    .sort((a, b) => toMinutes(a.startTime as string) - toMinutes(b.startTime as string))

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1]
    const current = sorted[i]
    if (toMinutes(current.startTime as string) < toMinutes(prev.endTime as string)) {
      return 'Time ranges cannot overlap'
    }
  }

  return true
}

export const ScheduleOverrides: CollectionConfig = {
  slug: 'schedule-overrides',
  admin: {
    useAsTitle: 'reason',
    group: '📅 Scheduling & Availability',
    defaultColumns: ['date', 'reason', 'isClosed'],
    description:
      'Override regular business hours for specific dates (holidays, special events, etc.)',
  },
  access: {
    read: ({ req }) => req.user?.collection === 'users',
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'MMM d, yyyy',
        },
        description: 'The specific date for this override',
      },
    },
    {
      name: 'reason',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'e.g., Christmas Day, Special Event, Staff Training',
        description: 'Reason for the schedule change',
      },
    },
    {
      name: 'isClosed',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Check if the business is completely closed on this date',
      },
    },
    {
      name: 'timeRanges',
      type: 'array',
      admin: {
        description:
          'Optional: multiple open blocks (e.g., 08:00–12:00 and 14:00–17:00). If empty, the single open/close time below is used.',
        condition: (data) => !data?.isClosed,
      },
      validate: validateTimeRanges,
      fields: [
        {
          name: 'startTime',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'e.g., 08:00',
            description: 'Start time in HH:MM format',
          },
          validate: validateTimeValue,
        },
        {
          name: 'endTime',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'e.g., 12:00',
            description: 'End time in HH:MM format',
          },
          validate: validateTimeValue,
        },
      ],
    },
    {
      name: 'openTime',
      type: 'text',
      admin: {
        placeholder: 'e.g., 10:00',
        description:
          'Single opening time if open with different hours (HH:MM format). Leave empty if using time ranges above.',
        condition: (data) => !data?.isClosed,
      },
      validate: (
        value: string | null | undefined,
        { siblingData }: { siblingData: Record<string, unknown> },
      ) => {
        if (siblingData?.isClosed) return true
        if (
          siblingData?.timeRanges &&
          Array.isArray(siblingData.timeRanges) &&
          siblingData.timeRanges.length > 0
        ) {
          return true
        }
        if (!value) return 'Open time is required when not closed (or add a time range)'
        return validateTimeValue(value)
      },
    },
    {
      name: 'closeTime',
      type: 'text',
      admin: {
        placeholder: 'e.g., 14:00',
        description:
          'Single closing time if open with different hours (HH:MM format). Leave empty if using time ranges above.',
        condition: (data) => !data?.isClosed,
      },
      validate: (
        value: string | null | undefined,
        { siblingData }: { siblingData: Record<string, unknown> },
      ) => {
        if (siblingData?.isClosed) return true
        if (
          siblingData?.timeRanges &&
          Array.isArray(siblingData.timeRanges) &&
          siblingData.timeRanges.length > 0
        ) {
          return true
        }
        if (!value) return 'Close time is required when not closed (or add a time range)'
        return validateTimeValue(value)
      },
    },
  ],
  timestamps: true,
}
