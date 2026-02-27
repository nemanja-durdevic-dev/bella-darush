import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: '👔 Admin',
  },
  auth: true,
  // access: {
  //   read: adminOnly,
  //   create: adminOnly,
  //   update: adminOnly,
  //   delete: adminOnly,
  // },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
