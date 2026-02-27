import type { CollectionConfig } from 'payload'
import { adminOnly, anyone } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: '🖼️ Content',
  },
  access: {
    read: anyone,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
