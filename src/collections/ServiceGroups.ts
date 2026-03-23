import type { CollectionConfig } from 'payload'
import { adminsOnly, hideFromWorkers } from '../access'
import {
  revalidateAppointmentServicePageAfterChange,
  revalidateAppointmentServicePageAfterDelete,
} from '../hooks/revalidateAppointmentServicePage'

export const ServiceGroups: CollectionConfig = {
  slug: 'service-groups',
  labels: {
    singular: 'Service Group',
    plural: 'Service Groups',
  },
  defaultSort: 'sortOrder',
  admin: {
    useAsTitle: 'name',
    group: '🧩 Core Entities',
    hidden: hideFromWorkers,
    meta: {
      title: 'Service Groups',
    },
    defaultColumns: ['name', 'sortOrder', 'isActive', 'updatedAt'],
    description: 'Groups for organizing and ordering services in booking',
  },
  access: {
    read: adminsOnly,
    create: adminsOnly,
    update: adminsOnly,
    delete: adminsOnly,
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
