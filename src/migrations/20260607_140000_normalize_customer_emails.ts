import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    WITH duplicate_customers AS (
      SELECT
        "id",
        lower(btrim("email")) AS "normalized_email",
        first_value("id") OVER (
          PARTITION BY lower(btrim("email"))
          ORDER BY "created_at" ASC, "id" ASC
        ) AS "canonical_id"
      FROM "customers"
      WHERE "email" IS NOT NULL
    )
    UPDATE "appointments"
    SET "customer_id" = duplicate_customers."canonical_id"
    FROM duplicate_customers
    WHERE "appointments"."customer_id" = duplicate_customers."id"
      AND duplicate_customers."id" <> duplicate_customers."canonical_id";

    WITH duplicate_customers AS (
      SELECT
        "id",
        first_value("id") OVER (
          PARTITION BY lower(btrim("email"))
          ORDER BY "created_at" ASC, "id" ASC
        ) AS "canonical_id"
      FROM "customers"
      WHERE "email" IS NOT NULL
    )
    DELETE FROM "customers"
    USING duplicate_customers
    WHERE "customers"."id" = duplicate_customers."id"
      AND duplicate_customers."id" <> duplicate_customers."canonical_id";

    UPDATE "customers"
    SET "email" = lower(btrim("email"))
    WHERE "email" IS NOT NULL;
  `)
}

export async function down({
  db: _db,
  payload: _payload,
  req: _req,
}: MigrateDownArgs): Promise<void> {
  // Email normalization is intentionally not reversible.
}
