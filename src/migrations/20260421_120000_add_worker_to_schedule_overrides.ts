import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "schedule_overrides" ADD COLUMN IF NOT EXISTS "worker_id" uuid;
  ALTER TABLE "schedule_overrides" DROP CONSTRAINT IF EXISTS "schedule_overrides_worker_id_workers_id_fk";
  ALTER TABLE "schedule_overrides" ADD CONSTRAINT "schedule_overrides_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "schedule_overrides_worker_idx" ON "schedule_overrides" USING btree ("worker_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "schedule_overrides_worker_idx";
  ALTER TABLE "schedule_overrides" DROP CONSTRAINT IF EXISTS "schedule_overrides_worker_id_workers_id_fk";
  ALTER TABLE "schedule_overrides" DROP COLUMN IF EXISTS "worker_id";`)
}
