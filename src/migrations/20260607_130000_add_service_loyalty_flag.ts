import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services"
      ADD COLUMN IF NOT EXISTS "counts_toward_loyalty" boolean DEFAULT false;

    UPDATE "services"
    SET "counts_toward_loyalty" = true
    WHERE "name" ILIKE '%klipp%'
       OR "name" ILIKE '%skin-fade%';
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services"
      DROP COLUMN IF EXISTS "counts_toward_loyalty";
  `)
}
