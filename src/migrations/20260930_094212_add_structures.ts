import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_structures_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__structures_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "structures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"data" jsonb,
  	"source_path" varchar,
  	"source_repo" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_structures_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_structures_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_data" jsonb,
  	"version_source_path" varchar,
  	"version_source_repo" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__structures_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "structures_id" integer;
  ALTER TABLE "_structures_v" ADD CONSTRAINT "_structures_v_parent_id_structures_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."structures"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "structures_name_idx" ON "structures" USING btree ("name");
  CREATE UNIQUE INDEX "structures_source_path_idx" ON "structures" USING btree ("source_path");
  CREATE INDEX "structures_updated_at_idx" ON "structures" USING btree ("updated_at");
  CREATE INDEX "structures_created_at_idx" ON "structures" USING btree ("created_at");
  CREATE INDEX "structures__status_idx" ON "structures" USING btree ("_status");
  CREATE INDEX "_structures_v_parent_idx" ON "_structures_v" USING btree ("parent_id");
  CREATE INDEX "_structures_v_version_version_name_idx" ON "_structures_v" USING btree ("version_name");
  CREATE INDEX "_structures_v_version_version_source_path_idx" ON "_structures_v" USING btree ("version_source_path");
  CREATE INDEX "_structures_v_version_version_updated_at_idx" ON "_structures_v" USING btree ("version_updated_at");
  CREATE INDEX "_structures_v_version_version_created_at_idx" ON "_structures_v" USING btree ("version_created_at");
  CREATE INDEX "_structures_v_version_version__status_idx" ON "_structures_v" USING btree ("version__status");
  CREATE INDEX "_structures_v_created_at_idx" ON "_structures_v" USING btree ("created_at");
  CREATE INDEX "_structures_v_updated_at_idx" ON "_structures_v" USING btree ("updated_at");
  CREATE INDEX "_structures_v_latest_idx" ON "_structures_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_structures_fk" FOREIGN KEY ("structures_id") REFERENCES "public"."structures"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_structures_id_idx" ON "payload_locked_documents_rels" USING btree ("structures_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "structures" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_structures_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "structures" CASCADE;
  DROP TABLE "_structures_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_structures_fk";
  
  DROP INDEX "payload_locked_documents_rels_structures_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "structures_id";
  DROP TYPE "public"."enum_structures_status";
  DROP TYPE "public"."enum__structures_v_version_status";`)
}
