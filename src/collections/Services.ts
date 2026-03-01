import type { CollectionConfig } from 'payload'
import {
  revalidateAppointmentServicePageAfterChange,
  revalidateAppointmentServicePageAfterDelete,
} from '../hooks/revalidateAppointmentServicePage'
import { revalidateHomePageAfterChange, revalidateHomePageAfterDelete } from '../hooks/revalidateHomePage'

export const Services: CollectionConfig = {
  slug: 'services',
  defaultSort: 'name',
  admin: {
    useAsTitle: 'name',
    group: '🧩 Core Entities',
    defaultColumns: ['name', 'duration', 'price', 'isActive'],
  },
  access: {
    read: ({ req }) => req.user?.collection === 'users',
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  hooks: {
    afterChange: [revalidateAppointmentServicePageAfterChange, revalidateHomePageAfterChange],
    afterDelete: [revalidateAppointmentServicePageAfterDelete, revalidateHomePageAfterDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      min: 5,
      admin: {
        description:
          'Duration in minutes. Please note that the time slot depends on the service length',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Price in NOK',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this service is available for booking',
      },
    },
  ],
  timestamps: true,
}
