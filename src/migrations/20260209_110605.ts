import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "schedule_overrides_time_ranges" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"start_time" varchar,
  	"end_time" varchar
  );
  
  ALTER TABLE "locations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE IF EXISTS "locations" CASCADE;
  ALTER TABLE "workers_rels" DROP CONSTRAINT IF EXISTS "workers_rels_locations_fk";
  
  ALTER TABLE "business_hours" DROP CONSTRAINT IF EXISTS "business_hours_location_id_locations_id_fk";
  
  ALTER TABLE "schedule_overrides" DROP CONSTRAINT IF EXISTS "schedule_overrides_location_id_locations_id_fk";
  
  ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_location_id_locations_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_locations_fk";
  
  DROP INDEX IF EXISTS "workers_rels_locations_id_idx";
  DROP INDEX IF EXISTS "business_hours_location_idx";
  DROP INDEX IF EXISTS "schedule_overrides_location_idx";
  DROP INDEX IF EXISTS "appointments_location_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_locations_id_idx";
  ALTER TABLE "schedule_overrides_time_ranges" ADD CONSTRAINT "schedule_overrides_time_ranges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."schedule_overrides"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "schedule_overrides_time_ranges_order_idx" ON "schedule_overrides_time_ranges" USING btree ("_order");
  CREATE INDEX "schedule_overrides_time_ranges_parent_id_idx" ON "schedule_overrides_time_ranges" USING btree ("_parent_id");
  ALTER TABLE "workers_rels" DROP COLUMN IF EXISTS "locations_id";
  ALTER TABLE "business_hours" DROP COLUMN IF EXISTS "location_id";
  ALTER TABLE "schedule_overrides" DROP COLUMN IF EXISTS "location_id";
  ALTER TABLE "appointments" DROP COLUMN IF EXISTS "location_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "locations_id";
  DROP TYPE IF EXISTS "public"."enum_locations_timezone";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_locations_timezone" AS ENUM('Europe/Oslo', 'Europe/Stockholm', 'Europe/Copenhagen', 'Europe/London', 'UTC');
  CREATE TABLE "locations" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"address" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"postal_code" varchar,
  	"country" varchar DEFAULT 'Norway',
  	"coordinates_latitude" numeric,
  	"coordinates_longitude" numeric,
  	"contact_info_phone" varchar,
  	"contact_info_email" varchar,
  	"image_id" uuid,
  	"description" jsonb,
  	"timezone" "enum_locations_timezone" DEFAULT 'Europe/Oslo',
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "schedule_overrides_time_ranges" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "schedule_overrides_time_ranges" CASCADE;
  ALTER TABLE "workers_rels" ADD COLUMN "locations_id" uuid;
  ALTER TABLE "business_hours" ADD COLUMN "location_id" uuid NOT NULL;
  ALTER TABLE "schedule_overrides" ADD COLUMN "location_id" uuid;
  ALTER TABLE "appointments" ADD COLUMN "location_id" uuid NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "locations_id" uuid;
  ALTER TABLE "locations" ADD CONSTRAINT "locations_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "locations_slug_idx" ON "locations" USING btree ("slug");
  CREATE INDEX "locations_image_idx" ON "locations" USING btree ("image_id");
  CREATE INDEX "locations_updated_at_idx" ON "locations" USING btree ("updated_at");
  CREATE INDEX "locations_created_at_idx" ON "locations" USING btree ("created_at");
  ALTER TABLE "workers_rels" ADD CONSTRAINT "workers_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "schedule_overrides" ADD CONSTRAINT "schedule_overrides_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "appointments" ADD CONSTRAINT "appointments_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "workers_rels_locations_id_idx" ON "workers_rels" USING btree ("locations_id");
  CREATE INDEX "business_hours_location_idx" ON "business_hours" USING btree ("location_id");
  CREATE INDEX "schedule_overrides_location_idx" ON "schedule_overrides" USING btree ("location_id");
  CREATE INDEX "appointments_location_idx" ON "appointments" USING btree ("location_id");
  CREATE INDEX "payload_locked_documents_rels_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("locations_id");`)
}
