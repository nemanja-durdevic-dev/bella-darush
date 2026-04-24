import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "sort_order" numeric DEFAULT 0;
   UPDATE "workers"
   SET "sort_order" = CASE
     WHEN lower("name") = 'darush' THEN 0
     WHEN lower("name") = 'abdi' THEN 1
     ELSE COALESCE("sort_order", 0)
   END;
   ALTER TABLE "workers" ALTER COLUMN "sort_order" SET DEFAULT 0;
   UPDATE "workers" SET "sort_order" = 0 WHERE "sort_order" IS NULL;
   ALTER TABLE "workers" ALTER COLUMN "sort_order" SET NOT NULL;
   CREATE INDEX IF NOT EXISTS "workers_sort_order_idx" ON "workers" USING btree ("sort_order");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "workers_sort_order_idx";
   ALTER TABLE "workers" DROP COLUMN IF EXISTS "sort_order";`)
}
