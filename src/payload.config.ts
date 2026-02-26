import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { resendAdapter } from '@payloadcms/email-resend'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Services } from './collections/Services'
import { Workers } from './collections/Workers'
import { BusinessHours } from './collections/BusinessHours'
import { ScheduleOverrides } from './collections/ScheduleOverrides'
import { Customers } from './collections/Customers'
import { Appointments } from './collections/Appointments'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Services,
    Workers,
    BusinessHours,
    ScheduleOverrides,
    Customers,
    Appointments,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
    idType: 'uuid',
  }),
  email: resendAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'Service App',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  sharp,
  plugins: [],
})
