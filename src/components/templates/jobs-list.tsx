import { getPayload } from 'payload'
import React from 'react'

import type { Job } from '@/payload-types'
import config from '@/payload.config'

import {
  employmentTypeLabel,
  jobLocationLabel,
  jobsWhere,
  type JobFilters,
} from '@/lib/jobs'
import { jobsPluginOptions } from '@/plugins/jobs'

import type { TemplateProps } from './default'

// T006 — public job list (spec +wit/specs/arr/jobs/, FR-006/FR-007,
// NFR-001/NFR-004/NFR-007). Rendered two ways: as the `jobs-list` page
// template (content intro + filtered list) and as the basePath fallback
// in [[...path]]. Filters are plain GET params — server-side `where`.
const str = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v

export const JobsListTemplate = async ({
  page,
  renderBody,
  searchParams = {},
}: TemplateProps) => {
  const filters: JobFilters = {
    q: str(searchParams.q),
    category: str(searchParams.category),
    employmentType: str(searchParams.employmentType),
    location: str(searchParams.location),
  }
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'jobs',
    pagination: false,
    sort: '-datePosted',
    where: jobsWhere(filters),
  })

  const all = await payload.find({
    collection: 'jobs',
    pagination: false,
    where: { _status: { equals: 'published' } },
  })
  const uniq = (
    pick: (job: Job) => (null | string | undefined)[] | null | undefined,
  ) =>
    [...new Set(all.docs.flatMap((j) => pick(j) ?? []))]
      .filter((v): v is string => Boolean(v))
      .sort()
  const categories = uniq((j) => j.categories)
  const employmentTypes = uniq((j) => j.employmentType)
  const locations = uniq((j) =>
    j.jobLocation?.addressLocality
      ? [j.jobLocation.addressLocality]
      : [],
  )

  return (
    <article className="page" data-template="jobs-list">
      {renderBody(page.content)}
      <form className="jobs-list__filters" method="get">
        <input
          aria-label="Suche"
          defaultValue={filters.q}
          name="q"
          placeholder="Suche…"
          type="search"
        />
        <select
          aria-label="Kategorie"
          defaultValue={filters.category}
          name="category"
        >
          <option value="">Alle Kategorien</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          aria-label="Anstellungsart"
          defaultValue={filters.employmentType}
          name="employmentType"
        >
          <option value="">Alle Anstellungsarten</option>
          {employmentTypes.map((t) => (
            <option key={t} value={t}>
              {employmentTypeLabel(t)}
            </option>
          ))}
        </select>
        <select
          aria-label="Standort"
          defaultValue={filters.location}
          name="location"
        >
          <option value="">Alle Standorte</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <button type="submit">Filtern</button>
      </form>
      {docs.length === 0 ? (
        <p className="jobs-list__empty">
          Aktuell sind keine passenden Stellen ausgeschrieben.
        </p>
      ) : (
        <ul className="jobs-list__items">
          {docs.map((job) => (
            <li className="jobs-list__item" key={job.id}>
              <a href={job.path}>{job.title}</a>
              {job.employmentType?.length ? (
                <span className="jobs-list__employment">
                  {job.employmentType
                    .map(employmentTypeLabel)
                    .join(', ')}
                </span>
              ) : null}
              {jobLocationLabel(job) ? (
                <span className="jobs-list__location">
                  {jobLocationLabel(job)}
                </span>
              ) : null}
              {job.datePosted ? (
                <time
                  className="jobs-list__date"
                  dateTime={job.datePosted}
                >
                  {new Date(job.datePosted).toLocaleDateString('de-DE')}
                </time>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

// Fallback list render for the configured basePath when no page document
// claims the route (FR-013) — same filters, no page body.
export const JobsListFallback = async ({
  searchParams = {},
}: {
  searchParams?: TemplateProps['searchParams']
}) => {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'pages',
    limit: 1,
    where: { path: { equals: jobsPluginOptions.basePath } },
  })
  if (docs[0]) {
    // a pages doc claims the route — the normal resolution renders it
    return null
  }
  return JobsListTemplate({
    page: {
      content: null,
      template: 'jobs-list',
    } as TemplateProps['page'],
    renderBody: () => null,
    searchParams,
  })
}
