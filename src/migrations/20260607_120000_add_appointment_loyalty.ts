import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "appointments"
      ADD COLUMN IF NOT EXISTS "loyalty_is_free" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "loyalty_qualifying_count" numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "loyalty_progress_count" numeric DEFAULT 0;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "appointments"
      DROP COLUMN IF EXISTS "loyalty_is_free",
      DROP COLUMN IF EXISTS "loyalty_qualifying_count",
      DROP COLUMN IF EXISTS "loyalty_progress_count";
  `)
}
