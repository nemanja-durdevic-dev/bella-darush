import type { CollectionConfig } from 'payload'
import { adminsOnly, hideFromWorkers } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'User',
    plural: 'Users',
  },
  admin: {
    useAsTitle: 'email',
    group: '👔 Admin',
    hidden: hideFromWorkers,
    meta: {
      title: 'Admin Users',
    },
    description: 'Users who can access the Payload admin panel',
  },
  auth: true,
  access: {
    read: adminsOnly,
    create: adminsOnly,
    update: adminsOnly,
    delete: adminsOnly,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'worker',
      required: true,
      saveToJWT: true,
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Worker',
          value: 'worker',
        },
      ],
    },
  ],
}
