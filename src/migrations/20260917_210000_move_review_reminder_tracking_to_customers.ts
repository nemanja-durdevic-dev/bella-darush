import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "customers"
      ADD COLUMN IF NOT EXISTS "review_reminder_sent" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "review_reminder_sent_at" timestamp(3) with time zone;

    UPDATE "customers"
    SET
      "review_reminder_sent" = true,
      "review_reminder_sent_at" = sent."first_sent_at"
    FROM (
      SELECT
        "customer_id",
        MIN("emails_sent_review_reminder_sent_at") AS "first_sent_at"
      FROM "appointments"
      WHERE "emails_sent_review_reminder_sent" = true
      GROUP BY "customer_id"
    ) sent
    WHERE "customers"."id" = sent."customer_id";

    ALTER TABLE "appointments"
      DROP COLUMN IF EXISTS "emails_sent_review_reminder_sent",
      DROP COLUMN IF EXISTS "emails_sent_review_reminder_sent_at";
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "appointments"
      ADD COLUMN IF NOT EXISTS "emails_sent_review_reminder_sent" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "emails_sent_review_reminder_sent_at" timestamp(3) with time zone;

    UPDATE "appointments"
    SET
      "emails_sent_review_reminder_sent" = true,
      "emails_sent_review_reminder_sent_at" = "customers"."review_reminder_sent_at"
    FROM "customers"
    WHERE
      "appointments"."customer_id" = "customers"."id"
      AND "customers"."review_reminder_sent" = true;

    ALTER TABLE "customers"
      DROP COLUMN IF EXISTS "review_reminder_sent",
      DROP COLUMN IF EXISTS "review_reminder_sent_at";
  `)
}
