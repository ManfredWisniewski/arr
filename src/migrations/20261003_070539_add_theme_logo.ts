import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "theme" ADD COLUMN "logo_id" integer;
  ALTER TABLE "theme" ADD CONSTRAINT "theme_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "theme_logo_idx" ON "theme" USING btree ("logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "theme" DROP CONSTRAINT "theme_logo_id_media_id_fk";
  
  DROP INDEX "theme_logo_idx";
  ALTER TABLE "theme" DROP COLUMN "logo_id";`)
}
