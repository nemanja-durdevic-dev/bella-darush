import type { CollectionConfig } from 'payload'
import { anyone } from '../access'
import { preventDoubleBooking } from '../hooks/preventDoubleBooking'
import { validateServiceWorker } from '../hooks/validateServiceWorker'
import { sendAppointmentEmails } from '../hooks/sendAppointmentEmails'
import { generateCancellationToken } from '../hooks/generateCancellationToken'

const APPOINTMENT_STATUSES = [
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  admin: {
    useAsTitle: 'id',
    group: '📅 Scheduling & Availability',
    defaultColumns: [
      'customer',
      'service',
      'worker',
      'appointmentDate',
      'appointmentTime',
      'status',
    ],
  },
  access: {
    read: ({ req }) => req.user?.collection === 'users',
    create: anyone, // Keep booking flow open
  },
  hooks: {
    beforeChange: [generateCancellationToken, validateServiceWorker, preventDoubleBooking],
    afterChange: [sendAppointmentEmails],
  },
  fields: [
    // Customer relationship
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      admin: {
        description: 'The customer making this appointment',
      },
    },
    // Appointment details
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      required: true,
      filterOptions: {
        isActive: { equals: true },
      },
      admin: {
        description: 'Select a service first, then choose a worker',
      },
    },
    {
      name: 'worker',
      type: 'relationship',
      relationTo: 'workers',
      required: true,
      filterOptions: {
        isActive: { equals: true },
      },
      admin: {
        description:
          'Only active workers are shown. Service compatibility is validated automatically on save.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'appointmentDate',
          type: 'date',
          required: true,
          admin: {
            width: '50%',
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'MMM d, yyyy',
            },
          },
        },
        {
          name: 'appointmentTime',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
            placeholder: 'e.g., 10:00',
            description: 'Time in HH:MM format (24-hour)',
          },
          validate: (value: string | null | undefined) => {
            if (!value) return 'Appointment time is required'
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
            if (!timeRegex.test(value)) {
              return 'Please enter a valid time in HH:MM format (e.g., 10:00)'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'confirmed',
      options: APPOINTMENT_STATUSES,
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes or special requests',
      },
    },
    // Cancellation token for customer self-service
    {
      name: 'cancellationToken',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Secure token for customer cancellation (automatically generated)',
        position: 'sidebar',
      },
    },
    // Email notification tracking
    {
      name: 'emailsSent',
      type: 'group',
      admin: {
        description: 'Email notification tracking (automatically managed)',
      },
      fields: [
        {
          name: 'confirmationSent',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            readOnly: true,
            description: 'Customer confirmation email sent',
          },
        },
        {
          name: 'confirmationSentAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'businessNotificationSent',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            readOnly: true,
            description: 'Business notification email sent',
          },
        },
        {
          name: 'businessNotificationSentAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'reminderSent',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            readOnly: true,
            description: 'Reminder email sent',
          },
        },
        {
          name: 'reminderSentAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'cancellationSent',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            readOnly: true,
            description: 'Cancellation email sent',
          },
        },
        {
          name: 'cancellationSentAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
  ],
  timestamps: true,
}
