import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "service_groups" ADD COLUMN "sort_order" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "services" ADD COLUMN "sort_order" numeric DEFAULT 0 NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "service_groups" DROP COLUMN "sort_order";
  ALTER TABLE "services" DROP COLUMN "sort_order";`)
}
