import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Admin User',
    plural: 'Admin Users',
  },
  admin: {
    useAsTitle: 'email',
    group: '👔 Admin',
    meta: {
      title: 'Admin Users',
    },
    description: 'Users who can access the Payload admin panel',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
