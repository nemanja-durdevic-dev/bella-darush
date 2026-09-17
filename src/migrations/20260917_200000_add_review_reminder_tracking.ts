import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "appointments"
      ADD COLUMN IF NOT EXISTS "emails_sent_review_reminder_sent" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "emails_sent_review_reminder_sent_at" timestamp(3) with time zone;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "appointments"
      DROP COLUMN IF EXISTS "emails_sent_review_reminder_sent",
      DROP COLUMN IF EXISTS "emails_sent_review_reminder_sent_at";
  `)
}
