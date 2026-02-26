import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "service_groups_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"service_id" uuid NOT NULL,
  	"sort_order" numeric DEFAULT 0 NOT NULL
  );
  
  ALTER TABLE "services" DROP CONSTRAINT "services_group_id_service_groups_id_fk";
  
  DROP INDEX "services_group_idx";
  ALTER TABLE "service_groups_services" ADD CONSTRAINT "service_groups_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_groups_services" ADD CONSTRAINT "service_groups_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."service_groups"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "service_groups_services_order_idx" ON "service_groups_services" USING btree ("_order");
  CREATE INDEX "service_groups_services_parent_id_idx" ON "service_groups_services" USING btree ("_parent_id");
  CREATE INDEX "service_groups_services_service_idx" ON "service_groups_services" USING btree ("service_id");
  ALTER TABLE "services" DROP COLUMN "group_id";
  ALTER TABLE "services" DROP COLUMN "sort_order";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "service_groups_services" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "service_groups_services" CASCADE;
  ALTER TABLE "services" ADD COLUMN "group_id" uuid;
  ALTER TABLE "services" ADD COLUMN "sort_order" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "services" ADD CONSTRAINT "services_group_id_service_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."service_groups"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_group_idx" ON "services" USING btree ("group_id");`)
}
