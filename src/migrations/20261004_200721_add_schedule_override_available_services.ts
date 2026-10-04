import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "schedule_overrides_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" uuid
  );

  DO $$ BEGIN
    ALTER TABLE "schedule_overrides_rels" ADD CONSTRAINT "schedule_overrides_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."schedule_overrides"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "schedule_overrides_rels" ADD CONSTRAINT "schedule_overrides_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  CREATE INDEX IF NOT EXISTS "schedule_overrides_rels_order_idx" ON "schedule_overrides_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "schedule_overrides_rels_parent_idx" ON "schedule_overrides_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "schedule_overrides_rels_path_idx" ON "schedule_overrides_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "schedule_overrides_rels_services_id_idx" ON "schedule_overrides_rels" USING btree ("services_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "schedule_overrides_rels" CASCADE;`)
}
