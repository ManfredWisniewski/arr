import { RichText } from '@payloadcms/richtext-lexical/react'
import React from 'react'

import type { Job } from '@/payload-types'

import {
  employmentTypeLabel,
  jobLocationLabel,
  jobToJsonLd,
} from '@/lib/jobs'
import { jsxConverters } from '@/lib/jsx-converters'
import { getSiteUrl } from '@/lib/site'
import { jobsPluginOptions } from '@/plugins/jobs'

// T008/T009/T014 — public job detail (spec +wit/specs/arr/jobs/,
// FR-008/FR-009, NFR-001/NFR-004). Renders populated sections only, the
// schema.org JSON-LD block and the apply form posting to `applyPath`.
const section = (
  job: Job,
  name:
    | 'description'
    | 'responsibilities'
    | 'qualifications'
    | 'benefits'
    | 'contacts',
  label: string,
) =>
  job[name] ? (
    <section className={`job-detail__${name}`}>
      <h2>{label}</h2>
      <RichText converters={jsxConverters} data={job[name]!} />
    </section>
  ) : null

export const JobDetailTemplate = async ({
  job,
  applied,
}: {
  job: Job
  applied?: boolean
}) => {
  const baseUrl = await getSiteUrl()
  const jsonLd = jobToJsonLd(job, { baseUrl })
  const meta: string[] = [
    job.employmentType?.map(employmentTypeLabel).join(', ') || '',
    jobLocationLabel(job),
    job.workHours || '',
    job.industry || '',
  ].filter(Boolean)

  return (
    <article className="page job-detail">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <h1>{job.title}</h1>
      {meta.length ? (
        <p className="job-detail__meta">{meta.join(' · ')}</p>
      ) : null}
      {job.employmentBeginning ? (
        <p className="job-detail__start">
          Beginn: {job.employmentBeginning}
        </p>
      ) : null}
      {job.baseSalary?.value != null || job.baseSalary?.minValue != null ? (
        <p className="job-detail__salary">
          Vergütung:{' '}
          {[
            job.baseSalary?.minValue != null &&
            job.baseSalary?.maxValue != null
              ? `${job.baseSalary.minValue}–${job.baseSalary.maxValue}`
              : `${job.baseSalary?.value ?? job.baseSalary?.minValue}`,
            job.baseSalary?.currency,
            job.baseSalary?.unitType
              ? {
                  HOUR: 'pro Stunde',
                  DAY: 'pro Tag',
                  WEEK: 'pro Woche',
                  MONTH: 'pro Monat',
                  YEAR: 'pro Jahr',
                }[job.baseSalary.unitType]
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        </p>
      ) : null}

      {section(job, 'description', 'Beschreibung')}
      {section(job, 'responsibilities', 'Aufgaben')}
      {section(job, 'qualifications', 'Anforderungen')}
      {section(job, 'benefits', 'Benefits')}
      {section(job, 'contacts', 'Kontakt')}

      <section className="job-detail__apply" id="bewerbung">
        <h2>Bewerben</h2>
        {applied ? (
          <p className="job-detail__applied" role="status">
            Vielen Dank — Ihre Bewerbung ist eingegangen.
          </p>
        ) : (
          <form
            action={jobsPluginOptions.applyPath}
            encType="multipart/form-data"
            method="post"
          >
            <input name="job" type="hidden" value={job.id} />
            <p>
              <label htmlFor="apply-name">Name *</label>
              <input id="apply-name" name="name" required type="text" />
            </p>
            <p>
              <label htmlFor="apply-email">E-Mail *</label>
              <input id="apply-email" name="email" required type="email" />
            </p>
            <p>
              <label htmlFor="apply-phone">Telefon</label>
              <input id="apply-phone" name="phone" type="tel" />
            </p>
            <p>
              <label htmlFor="apply-message">Nachricht</label>
              <textarea id="apply-message" name="message" rows={5} />
            </p>
            <p>
              <label htmlFor="apply-cv">Lebenslauf (PDF/DOC)</label>
              <input
                accept={jobsPluginOptions.attachmentMimeTypes.join(',')}
                id="apply-cv"
                name="cv"
                type="file"
              />
            </p>
            {/* honeypot — invisible to humans, bots fill it (FR-011) */}
            <p aria-hidden="true" className="job-detail__hp">
              <label htmlFor="apply-website">Website</label>
              <input
                autoComplete="off"
                id="apply-website"
                name="website"
                tabIndex={-1}
                type="text"
              />
            </p>
            <button type="submit">Bewerbung senden</button>
          </form>
        )}
      </section>
    </article>
  )
}
