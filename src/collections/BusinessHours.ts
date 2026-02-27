import type { CollectionConfig } from 'payload'

const DAYS_OF_WEEK = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' },
]

export const BusinessHours: CollectionConfig = {
  slug: 'business-hours',
  admin: {
    useAsTitle: 'dayOfWeek',
    group: '📅 Scheduling & Availability',
    defaultColumns: ['dayOfWeek', 'openTime', 'closeTime', 'isClosed'],
  },
  access: {
    read: ({ req }) => req.user?.collection === 'users',
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    {
      name: 'dayOfWeek',
      type: 'select',
      required: true,
      options: DAYS_OF_WEEK,
    },
    {
      name: 'openTime',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'e.g., 09:00',
        description: 'Opening time in HH:MM format (24-hour)',
        condition: (data) => !data?.isClosed,
      },
      validate: (
        value: string | null | undefined,
        { siblingData }: { siblingData: Record<string, unknown> },
      ) => {
        // Skip validation if the business is closed
        if (siblingData?.isClosed) return true
        if (!value) return 'Open time is required when business is open'
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(value)) {
          return 'Please enter a valid time in HH:MM format (e.g., 09:00)'
        }
        return true
      },
    },
    {
      name: 'closeTime',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'e.g., 17:00',
        description: 'Closing time in HH:MM format (24-hour)',
        condition: (data) => !data?.isClosed,
      },
      validate: (
        value: string | null | undefined,
        { siblingData }: { siblingData: Record<string, unknown> },
      ) => {
        // Skip validation if the business is closed
        if (siblingData?.isClosed) return true
        if (!value) return 'Close time is required when business is open'
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(value)) {
          return 'Please enter a valid time in HH:MM format (e.g., 17:00)'
        }
        return true
      },
    },
    {
      name: 'isClosed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Check if business is closed on this day',
      },
    },
  ],
  timestamps: true,
}
