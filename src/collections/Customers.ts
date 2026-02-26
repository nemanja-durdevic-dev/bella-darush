import type { CollectionConfig } from 'payload'
import { anyone } from '../access'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'name',
    group: '🧩 Core Entities',
    defaultColumns: ['name', 'email', 'phone', 'createdAt'],
    description: 'Customer records for booking management',
  },
  access: {
    read: ({ req }) => req.user?.collection === 'users',
    create: anyone, // Keep booking flow open
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
