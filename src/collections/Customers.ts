import type { CollectionConfig } from 'payload'
import { adminsAndWorkers, adminsOnly, hideFromWorkers } from '../access'

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: {
    singular: 'Customer',
    plural: 'Customers',
  },
  admin: {
    useAsTitle: 'name',
    group: '🧩 Core Entities',
    hidden: hideFromWorkers,
    meta: {
      title: 'Customers',
    },
    defaultColumns: ['name', 'email', 'phone', 'createdAt'],
    description: 'Customer records for booking management',
  },
  access: {
    read: adminsAndWorkers,
    create: adminsOnly,
    update: adminsOnly,
    delete: adminsOnly,
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
      required: true,
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this customer',
      },
    },
  ],
  timestamps: true,
}
