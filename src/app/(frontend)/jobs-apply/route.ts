import { getPayload } from 'payload'

import config from '@/payload.config'

import { jobsPluginOptions } from '@/plugins/jobs'

// POST /jobs-apply — application intake (spec +wit/specs/arr/jobs/,
// FR-010..FR-012, NFR-002/NFR-003/NFR-006). Multipart form from the job
// detail page; honeypot + server-side validation mirror the WP plugin's
// apply form. All writes go through the local API (the collections'
// public create access is closed).
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000

const str = (v: FormDataEntryValue | null) =>
  typeof v === 'string' ? v.trim() : ''

export async function POST(request: Request) {
  if (jobsPluginOptions.enabled === false) {
    return new Response('Not found', { status: 404 })
  }
  const payload = await getPayload({ config: await config })
  const form = await request.formData()

  const jobId = Number(form.get('job'))
  const job = Number.isInteger(jobId)
    ? await payload
        .findByID({ collection: 'jobs', id: jobId })
        .catch(() => null)
    : null
  const successUrl = job?.path
    ? `${job.path}?applied=1#bewerbung`
    : '/'

  // Honeypot (FR-011): bots see a normal success, nothing is stored.
  if (str(form.get('website'))) {
    return Response.redirect(new URL(successUrl, request.url), 303)
  }
  if (!job || job._status !== 'published') {
    return new Response('Bad request', { status: 400 })
  }

  const name = str(form.get('name'))
  const email = str(form.get('email'))
  const phone = str(form.get('phone'))
  const message = str(form.get('message'))
  if (!name || !email) {
    return new Response('Missing required fields', { status: 400 })
  }

  const file = form.get('cv')
  const isFile = file instanceof File && file.size > 0
  if (
    isFile &&
    (file.size > jobsPluginOptions.attachmentMaxSize ||
      !jobsPluginOptions.attachmentMimeTypes.includes(file.type))
  ) {
    return new Response('Invalid attachment', { status: 400 })
  }

  // Double-submit guard (NFR-006): identical application inside the
  // window is treated as a retry — success without a second record.
  const { totalDocs } = await payload.count({
    collection: 'job-applications',
    where: {
      and: [
        { job: { equals: job.id } },
        { email: { equals: email } },
        { name: { equals: name } },
        {
          createdAt: {
            greater_than: new Date(
              Date.now() - DUPLICATE_WINDOW_MS,
            ).toISOString(),
          },
        },
      ],
    },
  })
  if (totalDocs > 0) {
    return Response.redirect(new URL(successUrl, request.url), 303)
  }

  let cvId: number | undefined
  if (isFile) {
    const attachment = await payload.create({
      collection: 'job-attachments',
      data: { kind: 'cv' },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: file.name.replace(/[^\w.()-]+/g, '_'),
        size: file.size,
      },
    })
    cvId = attachment.id
  }

  await payload.create({
    collection: 'job-applications',
    data: {
      job: job.id,
      name,
      email,
      ...(phone ? { phone } : {}),
      ...(message ? { message } : {}),
      ...(cvId ? { cv: cvId } : {}),
    },
  })

  // Notification (FR-012): recipient = per-job override → plugin default.
  // A missing email adapter must not fail the submission.
  const recipient =
    job.applicationEmail ?? jobsPluginOptions.defaultApplicationEmail
  if (recipient) {
    try {
      await payload.sendEmail({
        subject: `Bewerbung: ${job.title}`,
        text: [
          `Neue Bewerbung auf "${job.title}"`,
          ``,
          `Name: ${name}`,
          `E-Mail: ${email}`,
          phone ? `Telefon: ${phone}` : '',
          message ? `\nNachricht:\n${message}` : '',
          cvId ? `\nLebenslauf: im CMS unter job-attachments #${cvId}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        to: recipient,
      })
    } catch (error) {
      payload.logger.warn(
        { err: error },
        'jobs: application notification failed',
      )
    }
  }

  return Response.redirect(new URL(successUrl, request.url), 303)
}
