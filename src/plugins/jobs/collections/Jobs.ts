import type { CollectionConfig } from 'payload'

import {
  authenticated,
  editorOnly,
  publishedOrAuthenticated,
} from '../../../access/roles'
import { pagesEditor } from '../../../editor'
import { clampPublicFind } from '../../../hooks/clampPublicFind'
import { enforceEditorPublish } from '../../../hooks/enforceEditorPublish'
import {
  resubmitSitemapAfterChange,
  resubmitSitemapAfterDelete,
} from '../../../hooks/resubmitSitemap'

import { markdownToSections } from '../hooks/markdownSections'

// schema.org employmentType vocabulary (WP plugin's checkbox options).
export const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACTOR',
  'TEMPORARY',
  'INTERN',
  'VOLUNTEER',
  'PER_DIEM',
  'OTHER',
] as const

// schema.org unitText vocabulary for baseSalary (WP "unitText" options).
export const SALARY_UNITS = [
  'HOUR',
  'DAY',
  'WEEK',
  'MONTH',
  'YEAR',
] as const

// Rich-text section <-> raw-markdown pairs converted on write (FR-002).
const MARKDOWN_SECTIONS: [string, string][] = [
  ['descriptionRaw', 'description'],
  ['responsibilitiesRaw', 'responsibilities'],
  ['qualificationsRaw', 'qualifications'],
  ['benefitsRaw', 'benefits'],
  ['contactsRaw', 'contacts'],
]

const richSection = (name: string, label: string) => ({
  name: `${name}Raw`,
  type: 'textarea' as const,
  label: `${label} (Markdown)`,
})

// T003/T004 — synced `jobs` collection (spec +wit/specs/arr/jobs/,
// FR-001..FR-005, FR-015). Follows the Posts.ts contract: content pushed
// via REST, `path` is the public route, `sourcePath` the upsert key.
export const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'datePosted', 'updatedAt'],
    preview: (doc, { req }) =>
      `${req.origin}/preview?secret=${process.env.PREVIEW_SECRET}&path=${encodeURIComponent(String(doc.path ?? ''))}`,
  },
  versions: {
    drafts: true,
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: editorOnly,
  },
  hooks: {
    afterChange: [resubmitSitemapAfterChange],
    afterDelete: [resubmitSitemapAfterDelete],
    beforeOperation: [clampPublicFind],
    beforeValidate: [markdownToSections(MARKDOWN_SECTIONS)],
    beforeChange: [enforceEditorPublish],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
    },
    {
      // full public route, e.g. /karriere/senior-developer
      name: 'path',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown) =>
        typeof value === 'string' && /^[^\s<>&"']+$/.test(value)
          ? true
          : 'Path must not contain whitespace or markup characters',
    },
    {
      name: 'employmentType',
      type: 'select',
      hasMany: true,
      options: EMPLOYMENT_TYPES.map((value) => ({ label: value, value })),
    },
    {
      name: 'employmentBeginning',
      type: 'textarea',
    },
    {
      name: 'employmentDuration',
      type: 'text',
    },
    {
      name: 'industry',
      type: 'text',
    },
    {
      // schema.org PostalAddress — FR-002
      name: 'jobLocation',
      type: 'group',
      fields: [
        { name: 'streetAddress', type: 'text' },
        { name: 'addressLocality', type: 'text' },
        { name: 'addressRegion', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'addressCountry', type: 'text' },
      ],
    },
    richSection('description', 'Beschreibung'),
    { name: 'description', type: 'richText', editor: pagesEditor },
    richSection('responsibilities', 'Aufgaben'),
    { name: 'responsibilities', type: 'richText', editor: pagesEditor },
    richSection('qualifications', 'Anforderungen'),
    { name: 'qualifications', type: 'richText', editor: pagesEditor },
    richSection('benefits', 'Benefits'),
    { name: 'benefits', type: 'richText', editor: pagesEditor },
    richSection('contacts', 'Kontakt'),
    { name: 'contacts', type: 'richText', editor: pagesEditor },
    {
      name: 'workHours',
      type: 'textarea',
    },
    {
      // schema.org MonetaryAmount — FR-002
      name: 'baseSalary',
      type: 'group',
      fields: [
        { name: 'currency', type: 'text' },
        { name: 'value', type: 'number' },
        { name: 'minValue', type: 'number' },
        { name: 'maxValue', type: 'number' },
        {
          name: 'unitType',
          type: 'select',
          options: SALARY_UNITS.map((value) => ({ label: value, value })),
        },
      ],
    },
    {
      name: 'datePosted',
      type: 'date',
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'validThrough',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      // schema.org Organization — FR-002
      name: 'hiringOrganization',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'url', type: 'text' },
        { name: 'logo', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      // per-job application recipient; falls back to the plugin option
      name: 'applicationEmail',
      type: 'email',
    },
    {
      name: 'categories',
      type: 'text',
      hasMany: true,
      validate: (value: unknown) =>
        value == null ||
        (Array.isArray(value) &&
          value.every(
            (v) => typeof v === 'string' && /^[^\s<>&"']+$/.test(v),
          ))
          ? true
          : 'Categories must not contain whitespace or markup characters',
    },
    {
      // repository-relative path of the source file; upsert idempotency key
      name: 'sourcePath',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'sourceRepo',
      type: 'text',
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'noindex',
          type: 'checkbox',
        },
      ],
    },
  ],
}
