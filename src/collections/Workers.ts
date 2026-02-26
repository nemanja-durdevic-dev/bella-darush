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

export const Workers: CollectionConfig = {
  slug: 'workers',
  admin: {
    useAsTitle: 'name',
    group: '🧩 Core Entities',
    defaultColumns: ['name', 'email', 'isActive'],
  },
  access: {
    read: ({ req }) => req.user?.collection === 'users',
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Profile image for this worker',
      },
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: {
        description: 'Services this worker can provide',
      },
    },
    {
      name: 'workingHours',
      type: 'array',
      admin: {
        description: 'Working hours for each day of the week',
      },
      fields: [
        {
          name: 'dayOfWeek',
          type: 'select',
          required: true,
          options: DAYS_OF_WEEK,
        },
        {
          name: 'startTime',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'e.g., 09:00',
            description: 'Start time in HH:MM format (24-hour)',
          },
          validate: (value: string | null | undefined) => {
            if (!value) return true
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
            if (!timeRegex.test(value)) {
              return 'Please enter a valid time in HH:MM format (e.g., 09:00)'
            }
            return true
          },
        },
        {
          name: 'endTime',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'e.g., 17:00',
            description: 'End time in HH:MM format (24-hour)',
          },
          validate: (value: string | null | undefined) => {
            if (!value) return true
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
            if (!timeRegex.test(value)) {
              return 'Please enter a valid time in HH:MM format (e.g., 17:00)'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this worker is available for booking',
      },
    },
  ],
  timestamps: true,
}
