import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "slide_options" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_slide_options" jsonb;
  ALTER TABLE "posts" ADD COLUMN "template" varchar;
  ALTER TABLE "posts" ADD COLUMN "slide_options" jsonb;
  ALTER TABLE "_posts_v" ADD COLUMN "version_template" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_slide_options" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "slide_options";
  ALTER TABLE "_pages_v" DROP COLUMN "version_slide_options";
  ALTER TABLE "posts" DROP COLUMN "template";
  ALTER TABLE "posts" DROP COLUMN "slide_options";
  ALTER TABLE "_posts_v" DROP COLUMN "version_template";
  ALTER TABLE "_posts_v" DROP COLUMN "version_slide_options";`)
}
