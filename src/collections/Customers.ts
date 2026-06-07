import type { CollectionConfig } from 'payload'
import { adminsAndWorkers, adminsOnly, hideFromWorkers } from '../access'
import { normalizeCustomerEmail } from '../hooks/normalizeCustomerEmail'

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
    defaultColumns: ['name', 'email', 'phone', 'updatedAt', 'createdAt'],
    description: 'Customer records for booking management',
  },
  access: {
    read: adminsAndWorkers,
    create: adminsOnly,
    update: adminsOnly,
    delete: adminsOnly,
  },
  hooks: {
    beforeValidate: [normalizeCustomerEmail],
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
