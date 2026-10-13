import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Structures } from './collections/Structures'
import { Theme } from './globals/Theme'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, Posts, Structures],
  globals: [Theme],
  // D08: field-level de/en; D10: per-locale publish status; D11: no
  // implicit fallback — public reads pass fallbackLocale explicitly.
  localization: {
    locales: [
      { code: 'de', label: 'Deutsch' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'de',
    fallback: false,
    defaultLocalePublishOption: 'active',
  },
  experimental: {
    localizeStatus: true,
  },
  i18n: {
    supportedLanguages: { de, en },
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      // DATABASE_URI is the canonical name (wit.docker_apps template);
      // DATABASE_URL is kept as a fallback for older deployments
      connectionString:
        process.env.DATABASE_URI || process.env.DATABASE_URL || '',
    },
  }),
  plugins: [],
  sharp,
})
