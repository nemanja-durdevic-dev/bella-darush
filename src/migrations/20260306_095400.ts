import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "appointments"
    ADD COLUMN IF NOT EXISTS "emails_sent_rebooking_reminder_sent" boolean DEFAULT false;
  ALTER TABLE "appointments"
    ADD COLUMN IF NOT EXISTS "emails_sent_rebooking_reminder_sent_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "appointments" DROP COLUMN IF EXISTS "emails_sent_rebooking_reminder_sent";
  ALTER TABLE "appointments" DROP COLUMN IF EXISTS "emails_sent_rebooking_reminder_sent_at";`)
}
