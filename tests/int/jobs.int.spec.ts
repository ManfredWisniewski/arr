// @vitest-environment node
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { POST } from '@/app/(frontend)/jobs-apply/route'
import {
  jobToJsonLd,
  jobsWhere,
} from '@/lib/jobs'
import { enforceEditorPublish } from '@/hooks/enforceEditorPublish'
import { REVIEW_COLLECTIONS } from '@/lib/review'
import { Jobs } from '@/plugins/jobs/collections/Jobs'

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// Spec: +wit/specs/arr/jobs/ — push contract (FR-001/FR-005, SC-001/
// SC-006), list filters (FR-007, SC-002), JSON-LD (FR-009, SC-003) and
// the apply endpoint (FR-010..FR-012, SC-004).
let payload: Payload
const jobIds: number[] = []
const applicationIds: number[] = []
const attachmentIds: number[] = []

const minimalJob = (slug: string, extra: Record<string, unknown> = {}) =>
  ({
    title: `Job ${slug}`,
    slug,
    path: `/karriere/${slug}`,
    sourcePath: `jobs/${slug}.md`,
    datePosted: '2026-11-20',
    employmentType: ['FULL_TIME'],
    jobLocation: {
      addressLocality: 'Dresden',
      addressCountry: 'DE',
    },
    hiringOrganization: { name: 'WIT' },
    applicationEmail: 'hr@test.local',
    _status: 'published',
    ...extra,
  }) as never

const createJob = async (
  slug: string,
  extra: Record<string, unknown> = {},
) => {
  const job = await payload.create({
    collection: 'jobs',
    data: minimalJob(slug, extra),
    draft: false,
  })
  jobIds.push(job.id)
  return job
}

const applyRequest = (fields: Record<string, string | File>) => {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    form.set(key, value)
  }
  return POST(
    new Request('http://localhost:3000/jobs-apply', {
      body: form,
      method: 'POST',
    }),
  )
}

describe('jobs', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const id of applicationIds) {
      await payload.delete({ collection: 'job-applications', id })
    }
    for (const id of attachmentIds) {
      await payload.delete({ collection: 'job-attachments', id })
    }
    for (const id of jobIds) {
      await payload.delete({ collection: 'jobs', id })
    }
  })

  it('converts pushed markdown sections into rich text', async () => {
    const job = await createJob('md', {
      descriptionRaw: '# Intro\n\nBody.',
      qualificationsRaw: '## Must\n\n- Skill',
    })

    const description = job.description?.root?.children ?? []
    expect(description[0]?.type).toBe('heading')
    const qualifications = job.qualifications?.root?.children ?? []
    expect(qualifications[0]?.type).toBe('heading')
  })

  it('upserts on sourcePath — second push updates the same doc', async () => {
    const first = await createJob('upsert', { title: 'Old' })
    const { docs } = await payload.find({
      collection: 'jobs',
      where: { sourcePath: { equals: 'jobs/upsert.md' } },
    })
    const updated = await payload.update({
      collection: 'jobs',
      id: docs[0]!.id,
      data: { title: 'New' },
      draft: false,
    })
    expect(updated.id).toBe(first.id)
    expect(updated.title).toBe('New')
    const { totalDocs } = await payload.count({
      collection: 'jobs',
      where: { sourcePath: { equals: 'jobs/upsert.md' } },
    })
    expect(totalDocs).toBe(1)
  })

  it('keeps drafts invisible to the public read access rule', async () => {
    // access-level check: the rule returns a published-only query for
    // anonymous requests (local API itself bypasses access).
    const read = Jobs.access!.read as (args: {
      req: { user: null | { role: string } }
    }) => unknown
    expect(read({ req: { user: null } })).toEqual({
      _status: { equals: 'published' },
    })
    expect(read({ req: { user: { role: 'content-bot' } } })).toBe(true)
  })

  it('wires the editor-only publish gate like posts', async () => {
    // enforceEditorPublish skips payloadAPI 'local', so the gate is
    // verified as wiring + hook behavior rather than a REST round-trip.
    expect(Jobs.hooks?.beforeChange).toContain(enforceEditorPublish)
    expect(() =>
      enforceEditorPublish({
        data: { _status: 'published' },
        req: {
          payloadAPI: 'REST',
          user: { role: 'content-bot' },
        } as never,
      } as never),
    ).toThrow('Only editors can publish')
  })

  it('is part of the review/publish collections', () => {
    expect(REVIEW_COLLECTIONS).toContain('jobs')
  })

  it('narrows the list by q, category, employmentType and location', async () => {
    await createJob('filter-a', {
      categories: ['dev'],
      jobLocation: { addressLocality: 'Dresden' },
    })
    await createJob('filter-b', {
      categories: ['sales'],
      employmentType: ['PART_TIME'],
      jobLocation: { addressLocality: 'Leipzig' },
      title: 'Vertrieb',
    })

    const run = (filters: Parameters<typeof jobsWhere>[0]) =>
      payload.find({
        collection: 'jobs',
        pagination: false,
        where: jobsWhere(filters),
      })

    const all = await run({})
    const slugs = all.docs.map((d) => d.slug)
    expect(slugs).toEqual(
      expect.arrayContaining(['filter-a', 'filter-b']),
    )

    const byQ = await run({ q: 'Vertrieb' })
    expect(byQ.docs.map((d) => d.slug)).toEqual(['filter-b'])
    const byCategory = await run({ category: 'dev' })
    expect(byCategory.docs.map((d) => d.slug)).toContain('filter-a')
    expect(byCategory.docs.map((d) => d.slug)).not.toContain('filter-b')
    const byType = await run({ employmentType: 'PART_TIME' })
    expect(byType.docs.map((d) => d.slug)).toEqual(['filter-b'])
    const byLocation = await run({ location: 'Leipzig' })
    expect(byLocation.docs.map((d) => d.slug)).toEqual(['filter-b'])
  })

  it('emits schema.org JobPosting JSON-LD with populated fields only', async () => {
    const job = await createJob('jsonld', {
      validThrough: '2027-01-01',
      descriptionRaw: '# About\n\nBuild things.',
      benefitsRaw: 'Great perks.',
      baseSalary: { currency: 'EUR', minValue: 50000, maxValue: 70000, unitType: 'YEAR' },
      jobLocation: {
        addressLocality: 'Dresden',
        postalCode: '01067',
        addressCountry: 'DE',
      },
    })

    const ld = jobToJsonLd(job as never, { baseUrl: 'https://site.test' })
    expect(ld['@type']).toBe('JobPosting')
    expect(ld.title).toBe('Job jsonld')
    expect(ld.datePosted).toBe('2026-11-20')
    expect(ld.employmentType).toBe('FULL_TIME')
    expect(ld.validThrough).toBe('2027-01-01')
    expect(ld.url).toBe('https://site.test/karriere/jsonld')
    expect(ld.description).toContain('Build things')
    expect(ld.jobBenefits).toContain('Great perks')
    expect(ld.qualifications).toBeUndefined()
    const salary = ld.baseSalary as Record<string, unknown>
    expect(salary.currency).toBe('EUR')
    const value = salary.value as Record<string, unknown>
    expect(value.minValue).toBe(50000)
    expect(value.unitText).toBe('YEAR')
    const location = ld.jobLocation as {
      address: Record<string, unknown>
    }
    expect(location.address.addressLocality).toBe('Dresden')
    expect(location.address.streetAddress).toBeUndefined()
  })

  it('stores an application + CV and notifies the job recipient', async () => {
    const job = await createJob('apply', { title: 'Dev' })
    const sendEmail = vi
      .spyOn(payload, 'sendEmail')
      .mockResolvedValue({} as never)
    const file = new File(['%PDF-1.4 fake'], 'cv.pdf', {
      type: 'application/pdf',
    })

    const res = await applyRequest({
      job: String(job.id),
      name: 'Ada Test',
      email: 'ada@test.local',
      message: 'Hallo',
      cv: file,
    })

    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('applied=1')

    const { docs: applications } = await payload.find({
      collection: 'job-applications',
      where: { job: { equals: job.id } },
    })
    expect(applications).toHaveLength(1)
    applicationIds.push(applications[0]!.id)
    expect(applications[0]!.email).toBe('ada@test.local')
    const cv = applications[0]!.cv as { id: number }
    expect(cv?.id).toBeTypeOf('number')
    attachmentIds.push(cv.id)

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'hr@test.local' }),
    )
    sendEmail.mockRestore()
  })

  it('silently discards honeypot submissions', async () => {
    const job = await createJob('hp')
    const res = await applyRequest({
      job: String(job.id),
      name: 'Bot',
      email: 'bot@test.local',
      website: 'http://spam',
    })
    expect(res.status).toBe(303)
    const { totalDocs } = await payload.count({
      collection: 'job-applications',
      where: { job: { equals: job.id } },
    })
    expect(totalDocs).toBe(0)
  })

  it('rejects missing fields and disallowed file types', async () => {
    const job = await createJob('reject')
    expect(
      (await applyRequest({ job: String(job.id), email: 'x@y.z' }))
        .status,
    ).toBe(400)
    expect(
      (
        await applyRequest({
          job: String(job.id),
          name: 'A',
          email: 'a@b.c',
          cv: new File(['x'], 'x.exe', {
            type: 'application/x-msdownload',
          }),
        })
      ).status,
    ).toBe(400)
    const { totalDocs } = await payload.count({
      collection: 'job-applications',
      where: { job: { equals: job.id } },
    })
    expect(totalDocs).toBe(0)
  })

  it('treats a retry inside the duplicate window as idempotent', async () => {
    const job = await createJob('dup')
    const fields = {
      job: String(job.id),
      name: 'Retry',
      email: 'retry@test.local',
    }
    const first = await applyRequest(fields)
    expect(first.status).toBe(303)
    const { docs } = await payload.find({
      collection: 'job-applications',
      where: { job: { equals: job.id } },
    })
    applicationIds.push(docs[0]!.id)

    const second = await applyRequest(fields)
    expect(second.status).toBe(303)
    const { totalDocs } = await payload.count({
      collection: 'job-applications',
      where: { job: { equals: job.id } },
    })
    expect(totalDocs).toBe(1)
  })
})
