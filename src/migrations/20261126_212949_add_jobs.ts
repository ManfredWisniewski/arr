import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_jobs_employment_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN', 'VOLUNTEER', 'PER_DIEM', 'OTHER');
  CREATE TYPE "public"."enum_jobs_base_salary_unit_type" AS ENUM('HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR');
  CREATE TYPE "public"."enum_jobs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__jobs_v_version_employment_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN', 'VOLUNTEER', 'PER_DIEM', 'OTHER');
  CREATE TYPE "public"."enum__jobs_v_version_base_salary_unit_type" AS ENUM('HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR');
  CREATE TYPE "public"."enum__jobs_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "jobs_employment_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_jobs_employment_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"path" varchar,
  	"employment_beginning" varchar,
  	"employment_duration" varchar,
  	"industry" varchar,
  	"job_location_street_address" varchar,
  	"job_location_address_locality" varchar,
  	"job_location_address_region" varchar,
  	"job_location_postal_code" varchar,
  	"job_location_address_country" varchar,
  	"description_raw" varchar,
  	"description" jsonb,
  	"responsibilities_raw" varchar,
  	"responsibilities" jsonb,
  	"qualifications_raw" varchar,
  	"qualifications" jsonb,
  	"benefits_raw" varchar,
  	"benefits" jsonb,
  	"contacts_raw" varchar,
  	"contacts" jsonb,
  	"work_hours" varchar,
  	"base_salary_currency" varchar,
  	"base_salary_value" numeric,
  	"base_salary_min_value" numeric,
  	"base_salary_max_value" numeric,
  	"base_salary_unit_type" "enum_jobs_base_salary_unit_type",
  	"date_posted" timestamp(3) with time zone,
  	"valid_through" timestamp(3) with time zone,
  	"hiring_organization_name" varchar,
  	"hiring_organization_url" varchar,
  	"hiring_organization_logo_id" integer,
  	"application_email" varchar,
  	"source_path" varchar,
  	"source_repo" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_noindex" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_jobs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "jobs_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_jobs_v_version_employment_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__jobs_v_version_employment_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_jobs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_path" varchar,
  	"version_employment_beginning" varchar,
  	"version_employment_duration" varchar,
  	"version_industry" varchar,
  	"version_job_location_street_address" varchar,
  	"version_job_location_address_locality" varchar,
  	"version_job_location_address_region" varchar,
  	"version_job_location_postal_code" varchar,
  	"version_job_location_address_country" varchar,
  	"version_description_raw" varchar,
  	"version_description" jsonb,
  	"version_responsibilities_raw" varchar,
  	"version_responsibilities" jsonb,
  	"version_qualifications_raw" varchar,
  	"version_qualifications" jsonb,
  	"version_benefits_raw" varchar,
  	"version_benefits" jsonb,
  	"version_contacts_raw" varchar,
  	"version_contacts" jsonb,
  	"version_work_hours" varchar,
  	"version_base_salary_currency" varchar,
  	"version_base_salary_value" numeric,
  	"version_base_salary_min_value" numeric,
  	"version_base_salary_max_value" numeric,
  	"version_base_salary_unit_type" "enum__jobs_v_version_base_salary_unit_type",
  	"version_date_posted" timestamp(3) with time zone,
  	"version_valid_through" timestamp(3) with time zone,
  	"version_hiring_organization_name" varchar,
  	"version_hiring_organization_url" varchar,
  	"version_hiring_organization_logo_id" integer,
  	"version_application_email" varchar,
  	"version_source_path" varchar,
  	"version_source_repo" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_noindex" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__jobs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_jobs_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "job_applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"job_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"message" varchar,
  	"cv_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "job_attachments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "jobs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "job_applications_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "job_attachments_id" integer;
  ALTER TABLE "jobs_employment_type" ADD CONSTRAINT "jobs_employment_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_hiring_organization_logo_id_media_id_fk" FOREIGN KEY ("hiring_organization_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jobs_texts" ADD CONSTRAINT "jobs_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v_version_employment_type" ADD CONSTRAINT "_jobs_v_version_employment_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_parent_id_jobs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_version_hiring_organization_logo_id_media_id_fk" FOREIGN KEY ("version_hiring_organization_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v_texts" ADD CONSTRAINT "_jobs_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_cv_id_job_attachments_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."job_attachments"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "jobs_employment_type_order_idx" ON "jobs_employment_type" USING btree ("order");
  CREATE INDEX "jobs_employment_type_parent_idx" ON "jobs_employment_type" USING btree ("parent_id");
  CREATE UNIQUE INDEX "jobs_path_idx" ON "jobs" USING btree ("path");
  CREATE INDEX "jobs_date_posted_idx" ON "jobs" USING btree ("date_posted");
  CREATE INDEX "jobs_hiring_organization_hiring_organization_logo_idx" ON "jobs" USING btree ("hiring_organization_logo_id");
  CREATE UNIQUE INDEX "jobs_source_path_idx" ON "jobs" USING btree ("source_path");
  CREATE INDEX "jobs_updated_at_idx" ON "jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");
  CREATE INDEX "jobs__status_idx" ON "jobs" USING btree ("_status");
  CREATE INDEX "jobs_texts_order_parent" ON "jobs_texts" USING btree ("order","parent_id");
  CREATE INDEX "_jobs_v_version_employment_type_order_idx" ON "_jobs_v_version_employment_type" USING btree ("order");
  CREATE INDEX "_jobs_v_version_employment_type_parent_idx" ON "_jobs_v_version_employment_type" USING btree ("parent_id");
  CREATE INDEX "_jobs_v_parent_idx" ON "_jobs_v" USING btree ("parent_id");
  CREATE INDEX "_jobs_v_version_version_path_idx" ON "_jobs_v" USING btree ("version_path");
  CREATE INDEX "_jobs_v_version_version_date_posted_idx" ON "_jobs_v" USING btree ("version_date_posted");
  CREATE INDEX "_jobs_v_version_hiring_organization_version_hiring_organ_idx" ON "_jobs_v" USING btree ("version_hiring_organization_logo_id");
  CREATE INDEX "_jobs_v_version_version_source_path_idx" ON "_jobs_v" USING btree ("version_source_path");
  CREATE INDEX "_jobs_v_version_version_updated_at_idx" ON "_jobs_v" USING btree ("version_updated_at");
  CREATE INDEX "_jobs_v_version_version_created_at_idx" ON "_jobs_v" USING btree ("version_created_at");
  CREATE INDEX "_jobs_v_version_version__status_idx" ON "_jobs_v" USING btree ("version__status");
  CREATE INDEX "_jobs_v_created_at_idx" ON "_jobs_v" USING btree ("created_at");
  CREATE INDEX "_jobs_v_updated_at_idx" ON "_jobs_v" USING btree ("updated_at");
  CREATE INDEX "_jobs_v_latest_idx" ON "_jobs_v" USING btree ("latest");
  CREATE INDEX "_jobs_v_texts_order_parent" ON "_jobs_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "job_applications_job_idx" ON "job_applications" USING btree ("job_id");
  CREATE INDEX "job_applications_cv_idx" ON "job_applications" USING btree ("cv_id");
  CREATE INDEX "job_applications_updated_at_idx" ON "job_applications" USING btree ("updated_at");
  CREATE INDEX "job_applications_created_at_idx" ON "job_applications" USING btree ("created_at");
  CREATE INDEX "job_attachments_updated_at_idx" ON "job_attachments" USING btree ("updated_at");
  CREATE INDEX "job_attachments_created_at_idx" ON "job_attachments" USING btree ("created_at");
  CREATE UNIQUE INDEX "job_attachments_filename_idx" ON "job_attachments" USING btree ("filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_job_applications_fk" FOREIGN KEY ("job_applications_id") REFERENCES "public"."job_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_job_attachments_fk" FOREIGN KEY ("job_attachments_id") REFERENCES "public"."job_attachments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("jobs_id");
  CREATE INDEX "payload_locked_documents_rels_job_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("job_applications_id");
  CREATE INDEX "payload_locked_documents_rels_job_attachments_id_idx" ON "payload_locked_documents_rels" USING btree ("job_attachments_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "jobs_employment_type" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "jobs_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v_version_employment_type" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "job_applications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "job_attachments" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "jobs_employment_type" CASCADE;
  DROP TABLE "jobs" CASCADE;
  DROP TABLE "jobs_texts" CASCADE;
  DROP TABLE "_jobs_v_version_employment_type" CASCADE;
  DROP TABLE "_jobs_v" CASCADE;
  DROP TABLE "_jobs_v_texts" CASCADE;
  DROP TABLE "job_applications" CASCADE;
  DROP TABLE "job_attachments" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_jobs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_job_applications_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_job_attachments_fk";
  
  DROP INDEX "payload_locked_documents_rels_jobs_id_idx";
  DROP INDEX "payload_locked_documents_rels_job_applications_id_idx";
  DROP INDEX "payload_locked_documents_rels_job_attachments_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "jobs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "job_applications_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "job_attachments_id";
  DROP TYPE "public"."enum_jobs_employment_type";
  DROP TYPE "public"."enum_jobs_base_salary_unit_type";
  DROP TYPE "public"."enum_jobs_status";
  DROP TYPE "public"."enum__jobs_v_version_employment_type";
  DROP TYPE "public"."enum__jobs_v_version_base_salary_unit_type";
  DROP TYPE "public"."enum__jobs_v_version_status";`)
}
