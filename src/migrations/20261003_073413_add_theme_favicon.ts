import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "theme" ADD COLUMN "favicon_id" integer;
  ALTER TABLE "theme" ADD CONSTRAINT "theme_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "theme_favicon_idx" ON "theme" USING btree ("favicon_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "theme" DROP CONSTRAINT "theme_favicon_id_media_id_fk";
  
  DROP INDEX "theme_favicon_idx";
  ALTER TABLE "theme" DROP COLUMN "favicon_id";`)
}
