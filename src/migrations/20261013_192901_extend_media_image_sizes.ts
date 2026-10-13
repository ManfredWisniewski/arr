import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "sizes_logo_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_logo_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_logo_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_logo_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_logo_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_logo_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_content_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_content_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_content_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_content_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_content_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_content_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filename" varchar;
  CREATE INDEX "media_sizes_logo_sizes_logo_filename_idx" ON "media" USING btree ("sizes_logo_filename");
  CREATE INDEX "media_sizes_content_sizes_content_filename_idx" ON "media" USING btree ("sizes_content_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_sizes_logo_sizes_logo_filename_idx";
  DROP INDEX "media_sizes_content_sizes_content_filename_idx";
  DROP INDEX "media_sizes_hero_sizes_hero_filename_idx";
  ALTER TABLE "media" DROP COLUMN "sizes_logo_url";
  ALTER TABLE "media" DROP COLUMN "sizes_logo_width";
  ALTER TABLE "media" DROP COLUMN "sizes_logo_height";
  ALTER TABLE "media" DROP COLUMN "sizes_logo_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_logo_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_logo_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_content_url";
  ALTER TABLE "media" DROP COLUMN "sizes_content_width";
  ALTER TABLE "media" DROP COLUMN "sizes_content_height";
  ALTER TABLE "media" DROP COLUMN "sizes_content_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_content_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_content_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_url";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_width";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_height";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filename";`)
}
