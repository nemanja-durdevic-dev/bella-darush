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
  // Do NOT set any public or access property here; privacy is controlled by the storage adapter in payload.config.ts
  upload: true,
}
