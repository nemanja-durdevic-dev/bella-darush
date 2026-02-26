import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "service_groups" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "appointments_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" uuid
  );
  
  ALTER TABLE "appointments" DROP CONSTRAINT "appointments_service_id_services_id_fk";
  
  DROP INDEX "appointments_service_idx";
  ALTER TABLE "services" ADD COLUMN "group_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "service_groups_id" uuid;
  ALTER TABLE "appointments_rels" ADD CONSTRAINT "appointments_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appointments_rels" ADD CONSTRAINT "appointments_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "service_groups_updated_at_idx" ON "service_groups" USING btree ("updated_at");
  CREATE INDEX "service_groups_created_at_idx" ON "service_groups" USING btree ("created_at");
  CREATE INDEX "appointments_rels_order_idx" ON "appointments_rels" USING btree ("order");
  CREATE INDEX "appointments_rels_parent_idx" ON "appointments_rels" USING btree ("parent_id");
  CREATE INDEX "appointments_rels_path_idx" ON "appointments_rels" USING btree ("path");
  CREATE INDEX "appointments_rels_services_id_idx" ON "appointments_rels" USING btree ("services_id");
  ALTER TABLE "services" ADD CONSTRAINT "services_group_id_service_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."service_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_service_groups_fk" FOREIGN KEY ("service_groups_id") REFERENCES "public"."service_groups"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_group_idx" ON "services" USING btree ("group_id");
  CREATE INDEX "payload_locked_documents_rels_service_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("service_groups_id");
  ALTER TABLE "appointments" DROP COLUMN "service_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "service_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "appointments_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "service_groups" CASCADE;
  DROP TABLE "appointments_rels" CASCADE;
  ALTER TABLE "services" DROP CONSTRAINT "services_group_id_service_groups_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_service_groups_fk";
  
  DROP INDEX "services_group_idx";
  DROP INDEX "payload_locked_documents_rels_service_groups_id_idx";
  ALTER TABLE "appointments" ADD COLUMN "service_id" uuid NOT NULL;
  ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "appointments_service_idx" ON "appointments" USING btree ("service_id");
  ALTER TABLE "services" DROP COLUMN "group_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "service_groups_id";`)
}
