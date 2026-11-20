import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum__structures_v_published_locale" AS ENUM('de', 'en');
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"markdown_raw" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"_status" "enum_pages_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_markdown_raw" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"markdown_raw" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"_status" "enum_posts_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_markdown_raw" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "structures_locales" (
  	"data" jsonb,
  	"_status" "enum_structures_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_structures_v_locales" (
  	"version_data" jsonb,
  	"version__status" "enum__structures_v_version_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  DROP INDEX "pages__status_idx";
  DROP INDEX "_pages_v_version_version__status_idx";
  DROP INDEX "posts__status_idx";
  DROP INDEX "_posts_v_version_version__status_idx";
  DROP INDEX "structures__status_idx";
  DROP INDEX "_structures_v_version_version__status_idx";
  ALTER TABLE "_pages_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_pages_v" ADD COLUMN "published_locale" "enum__pages_v_published_locale";
  ALTER TABLE "_posts_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "published_locale" "enum__posts_v_published_locale";
  ALTER TABLE "_structures_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_structures_v" ADD COLUMN "published_locale" "enum__structures_v_published_locale";
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "structures_locales" ADD CONSTRAINT "structures_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."structures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_structures_v_locales" ADD CONSTRAINT "_structures_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_structures_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages__status_idx" ON "pages_locales" USING btree ("_status","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v_locales" USING btree ("version__status","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts__status_idx" ON "posts_locales" USING btree ("_status","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v_locales" USING btree ("version__status","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "structures__status_idx" ON "structures_locales" USING btree ("_status","_locale");
  CREATE UNIQUE INDEX "structures_locales_locale_parent_id_unique" ON "structures_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_structures_v_version_version__status_idx" ON "_structures_v_locales" USING btree ("version__status","_locale");
  CREATE UNIQUE INDEX "_structures_v_locales_locale_parent_id_unique" ON "_structures_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_structures_v_snapshot_idx" ON "_structures_v" USING btree ("snapshot");
  CREATE INDEX "_structures_v_published_locale_idx" ON "_structures_v" USING btree ("published_locale");
  -- manual: preserve existing rows as the default locale ('de') before the
  -- localized columns are dropped (handover: copy values, don't lose data)
  INSERT INTO "media_locales" ("_locale","_parent_id","alt","caption")
  	SELECT 'de', "id", COALESCE("alt", ''), "caption" FROM "media";
  INSERT INTO "pages_locales" ("_locale","_parent_id","title","markdown_raw","content","meta_title","meta_description","_status")
  	SELECT 'de', "id", "title", "markdown_raw", "content", "meta_title", "meta_description", COALESCE("_status", 'draft'::"enum_pages_status") FROM "pages";
  INSERT INTO "posts_locales" ("_locale","_parent_id","title","excerpt","markdown_raw","content","meta_title","meta_description","_status")
  	SELECT 'de', "id", "title", "excerpt", "markdown_raw", "content", "meta_title", "meta_description", COALESCE("_status", 'draft'::"enum_posts_status") FROM "posts";
  INSERT INTO "structures_locales" ("_locale","_parent_id","data","_status")
  	SELECT 'de', "id", "data", COALESCE("_status", 'draft'::"enum_structures_status") FROM "structures";
  INSERT INTO "_pages_v_locales" ("_locale","_parent_id","version_title","version_markdown_raw","version_content","version_meta_title","version_meta_description","version__status")
  	SELECT 'de', "id", "version_title", "version_markdown_raw", "version_content", "version_meta_title", "version_meta_description", COALESCE("version__status", 'draft'::"enum__pages_v_version_status") FROM "_pages_v";
  INSERT INTO "_posts_v_locales" ("_locale","_parent_id","version_title","version_excerpt","version_markdown_raw","version_content","version_meta_title","version_meta_description","version__status")
  	SELECT 'de', "id", "version_title", "version_excerpt", "version_markdown_raw", "version_content", "version_meta_title", "version_meta_description", COALESCE("version__status", 'draft'::"enum__posts_v_version_status") FROM "_posts_v";
  INSERT INTO "_structures_v_locales" ("_locale","_parent_id","version_data","version__status")
  	SELECT 'de', "id", "version_data", COALESCE("version__status", 'draft'::"enum__structures_v_version_status") FROM "_structures_v";
  UPDATE "_pages_v" SET "published_locale" = 'de' WHERE "version__status" = 'published';
  UPDATE "_posts_v" SET "published_locale" = 'de' WHERE "version__status" = 'published';
  UPDATE "_structures_v" SET "published_locale" = 'de' WHERE "version__status" = 'published';
  ALTER TABLE "media" DROP COLUMN "alt";
  ALTER TABLE "media" DROP COLUMN "caption";
  ALTER TABLE "pages" DROP COLUMN "title";
  ALTER TABLE "pages" DROP COLUMN "markdown_raw";
  ALTER TABLE "pages" DROP COLUMN "content";
  ALTER TABLE "pages" DROP COLUMN "meta_title";
  ALTER TABLE "pages" DROP COLUMN "meta_description";
  ALTER TABLE "pages" DROP COLUMN "_status";
  ALTER TABLE "_pages_v" DROP COLUMN "version_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_markdown_raw";
  ALTER TABLE "_pages_v" DROP COLUMN "version_content";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version__status";
  ALTER TABLE "posts" DROP COLUMN "title";
  ALTER TABLE "posts" DROP COLUMN "excerpt";
  ALTER TABLE "posts" DROP COLUMN "markdown_raw";
  ALTER TABLE "posts" DROP COLUMN "content";
  ALTER TABLE "posts" DROP COLUMN "meta_title";
  ALTER TABLE "posts" DROP COLUMN "meta_description";
  ALTER TABLE "posts" DROP COLUMN "_status";
  ALTER TABLE "_posts_v" DROP COLUMN "version_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_excerpt";
  ALTER TABLE "_posts_v" DROP COLUMN "version_markdown_raw";
  ALTER TABLE "_posts_v" DROP COLUMN "version_content";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_posts_v" DROP COLUMN "version__status";
  ALTER TABLE "structures" DROP COLUMN "data";
  ALTER TABLE "structures" DROP COLUMN "_status";
  ALTER TABLE "_structures_v" DROP COLUMN "version_data";
  ALTER TABLE "_structures_v" DROP COLUMN "version__status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "structures_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_structures_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "structures_locales" CASCADE;
  DROP TABLE "_structures_v_locales" CASCADE;
  DROP INDEX "_pages_v_snapshot_idx";
  DROP INDEX "_pages_v_published_locale_idx";
  DROP INDEX "_posts_v_snapshot_idx";
  DROP INDEX "_posts_v_published_locale_idx";
  DROP INDEX "_structures_v_snapshot_idx";
  DROP INDEX "_structures_v_published_locale_idx";
  ALTER TABLE "media" ADD COLUMN "alt" varchar NOT NULL;
  ALTER TABLE "media" ADD COLUMN "caption" varchar;
  ALTER TABLE "pages" ADD COLUMN "title" varchar;
  ALTER TABLE "pages" ADD COLUMN "markdown_raw" varchar;
  ALTER TABLE "pages" ADD COLUMN "content" jsonb;
  ALTER TABLE "pages" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "pages" ADD COLUMN "_status" "enum_pages_status" DEFAULT 'draft';
  ALTER TABLE "_pages_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_markdown_raw" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_content" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version__status" "enum__pages_v_version_status" DEFAULT 'draft';
  ALTER TABLE "posts" ADD COLUMN "title" varchar;
  ALTER TABLE "posts" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "posts" ADD COLUMN "markdown_raw" varchar;
  ALTER TABLE "posts" ADD COLUMN "content" jsonb;
  ALTER TABLE "posts" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "posts" ADD COLUMN "_status" "enum_posts_status" DEFAULT 'draft';
  ALTER TABLE "_posts_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_excerpt" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_markdown_raw" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_content" jsonb;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version__status" "enum__posts_v_version_status" DEFAULT 'draft';
  ALTER TABLE "structures" ADD COLUMN "data" jsonb;
  ALTER TABLE "structures" ADD COLUMN "_status" "enum_structures_status" DEFAULT 'draft';
  ALTER TABLE "_structures_v" ADD COLUMN "version_data" jsonb;
  ALTER TABLE "_structures_v" ADD COLUMN "version__status" "enum__structures_v_version_status" DEFAULT 'draft';
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "structures__status_idx" ON "structures" USING btree ("_status");
  CREATE INDEX "_structures_v_version_version__status_idx" ON "_structures_v" USING btree ("version__status");
  ALTER TABLE "_pages_v" DROP COLUMN "snapshot";
  ALTER TABLE "_pages_v" DROP COLUMN "published_locale";
  ALTER TABLE "_posts_v" DROP COLUMN "snapshot";
  ALTER TABLE "_posts_v" DROP COLUMN "published_locale";
  ALTER TABLE "_structures_v" DROP COLUMN "snapshot";
  ALTER TABLE "_structures_v" DROP COLUMN "published_locale";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum__structures_v_published_locale";`)
}
