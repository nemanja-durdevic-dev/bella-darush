import type { CollectionConfig } from 'payload'
import {
  revalidateAppointmentServicePageAfterChange,
  revalidateAppointmentServicePageAfterDelete,
} from '../hooks/revalidateAppointmentServicePage'

export const ServiceGroups: CollectionConfig = {
  slug: 'service-groups',
  defaultSort: 'sortOrder',
  admin: {
    useAsTitle: 'name',
    group: '🧩 Core Entities',
    defaultColumns: ['name', 'sortOrder', 'isActive', 'updatedAt'],
  },
  access: {
    read: ({ req }) => req.user?.collection === 'users',
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  hooks: {
    afterChange: [revalidateAppointmentServicePageAfterChange],
    afterDelete: [revalidateAppointmentServicePageAfterDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Lower values appear first for groups',
      },
    },
    {
      name: 'services',
      type: 'array',
      admin: {
        description: 'Assign services to this group. Drag rows to set order within the group',
      },
      fields: [
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services',
          required: true,
          filterOptions: {
            isActive: {
              equals: true,
            },
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this group is available for selection',
      },
    },
  ],
  timestamps: true,
}
