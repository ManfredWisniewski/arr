import type { Where } from 'payload'

import type { Job } from '@/payload-types'

// Shared jobs helpers (spec +wit/specs/arr/jobs/, FR-007/FR-009): the
// filtered list query and the schema.org JobPosting JSON-LD builder.

export type JobFilters = {
  q?: string
  category?: string
  employmentType?: string
  location?: string
}

// Server-side filter for the list route — one query, no N+1 (NFR-007).
export const jobsWhere = (filters: JobFilters): Where => {
  const and: Where[] = [{ _status: { equals: 'published' } }]
  if (filters.q) {
    and.push({
      or: [
        { title: { like: filters.q } },
        { industry: { like: filters.q } },
        { 'jobLocation.addressLocality': { like: filters.q } },
      ],
    })
  }
  if (filters.category) {
    and.push({ categories: { equals: filters.category } })
  }
  if (filters.employmentType) {
    and.push({ employmentType: { equals: filters.employmentType } })
  }
  if (filters.location) {
    and.push({
      'jobLocation.addressLocality': { equals: filters.location },
    })
  }
  return { and }
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Vollzeit',
  PART_TIME: 'Teilzeit',
  CONTRACTOR: 'Freiberuflich',
  TEMPORARY: 'Befristet',
  INTERN: 'Praktikum',
  VOLUNTEER: 'Ehrenamt',
  PER_DIEM: 'Tagessatz',
  OTHER: 'Sonstiges',
}

export const employmentTypeLabel = (value?: null | string) =>
  (value && EMPLOYMENT_TYPE_LABELS[value]) || value || ''

const joinAddress = (job: Job) =>
  [
    job.jobLocation?.addressLocality,
    job.jobLocation?.addressRegion,
    job.jobLocation?.addressCountry,
  ]
    .filter(Boolean)
    .join(', ')

export const jobLocationLabel = (job: Job) => joinAddress(job)

// Lexical rich text -> plain text for the JSON-LD description fields.
const richTextToString = (value: unknown): string => {
  if (typeof value !== 'object' || value === null) {
    return ''
  }
  const walk = (node: unknown): string => {
    if (typeof node !== 'object' || node === null) {
      return ''
    }
    const n = node as { text?: unknown; children?: unknown[] }
    const own = typeof n.text === 'string' ? n.text : ''
    const kids = Array.isArray(n.children) ? n.children.map(walk) : []
    return [own, ...kids].filter(Boolean).join('')
  }
  return walk((value as { root?: unknown }).root)
}

// T009 — schema.org JobPosting (FR-009, SC-003): every populated field,
// never an empty key.
export const jobToJsonLd = (
  job: Job,
  opts: { baseUrl?: string } = {},
): Record<string, unknown> => {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    datePosted: job.datePosted?.slice(0, 10),
  }
  if (opts.baseUrl && job.path) {
    ld.url = `${opts.baseUrl}${job.path}`
  }
  if (job.employmentType?.length) {
    ld.employmentType =
      job.employmentType.length === 1
        ? job.employmentType[0]
        : job.employmentType
  }
  if (job.validThrough) {
    ld.validThrough = job.validThrough.slice(0, 10)
  }
  const org = job.hiringOrganization
  if (org?.name) {
    ld.hiringOrganization = {
      '@type': 'Organization',
      name: org.name,
      ...(org.url ? { sameAs: org.url } : {}),
      ...(typeof org.logo === 'object' && org.logo?.url
        ? { logo: org.logo.url }
        : {}),
    }
  }
  const loc = job.jobLocation
  if (
    loc &&
    (loc.streetAddress ||
      loc.addressLocality ||
      loc.addressRegion ||
      loc.postalCode ||
      loc.addressCountry)
  ) {
    ld.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...(loc.streetAddress ? { streetAddress: loc.streetAddress } : {}),
        ...(loc.addressLocality
          ? { addressLocality: loc.addressLocality }
          : {}),
        ...(loc.addressRegion ? { addressRegion: loc.addressRegion } : {}),
        ...(loc.postalCode ? { postalCode: loc.postalCode } : {}),
        ...(loc.addressCountry
          ? { addressCountry: loc.addressCountry }
          : {}),
      },
    }
  }
  const salary = job.baseSalary
  if (salary?.value != null || salary?.minValue != null) {
    ld.baseSalary = {
      '@type': 'MonetaryAmount',
      ...(salary.currency ? { currency: salary.currency } : {}),
      value: {
        '@type': 'QuantitativeValue',
        ...(salary.value != null ? { value: salary.value } : {}),
        ...(salary.minValue != null ? { minValue: salary.minValue } : {}),
        ...(salary.maxValue != null ? { maxValue: salary.maxValue } : {}),
        ...(salary.unitType ? { unitText: salary.unitType } : {}),
      },
    }
  }
  const text = (v: unknown) => richTextToString(v)
  const description = text(job.description)
  if (description) {
    ld.description = description
  }
  const responsibilities = text(job.responsibilities)
  if (responsibilities) {
    ld.responsibilities = responsibilities
  }
  const qualifications = text(job.qualifications)
  if (qualifications) {
    ld.qualifications = qualifications
  }
  const benefits = text(job.benefits)
  if (benefits) {
    ld.jobBenefits = benefits
  }
  return ld
}
