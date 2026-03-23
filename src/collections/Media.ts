import type { CollectionConfig } from 'payload'
import { adminsOnly, anyone, hideFromWorkers } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media Item',
    plural: 'Media Library',
  },
  admin: {
    group: '🖼️ Content',
    hidden: hideFromWorkers,
    meta: {
      title: 'Media Library',
    },
    description: 'Uploaded images and files used across the website',
  },
  access: {
    read: anyone,
    create: adminsOnly,
    update: adminsOnly,
    delete: adminsOnly,
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
