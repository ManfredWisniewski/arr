import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "theme" ALTER COLUMN "consent_privacy_path" SET DEFAULT '/datenschutz';
  ALTER TABLE "pages" ADD COLUMN "meta_noindex" boolean;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_noindex" boolean;
  ALTER TABLE "posts" ADD COLUMN "meta_noindex" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_noindex" boolean;
  ALTER TABLE "theme" ADD COLUMN "meta_lang" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "theme" ALTER COLUMN "consent_privacy_path" SET DEFAULT '/datenschutz'::character varying;
  ALTER TABLE "pages" DROP COLUMN "meta_noindex";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "posts" DROP COLUMN "meta_noindex";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "theme" DROP COLUMN "meta_lang";`)
}
