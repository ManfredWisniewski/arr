import config from '../src/payload.config'
import { getPayload } from 'payload'

const email = process.env.PAYLOAD_SEED_ADMIN_EMAIL
const password = process.env.PAYLOAD_SEED_ADMIN_PASSWORD

if (!email || !password) {
  throw new Error('PAYLOAD_SEED_ADMIN_EMAIL and PAYLOAD_SEED_ADMIN_PASSWORD are required')
}

const payload = await getPayload({ config })
const existing = await payload.find({
  collection: 'users',
  limit: 1,
  where: {
    email: {
      equals: email,
    },
  },
})

if (existing.totalDocs === 0) {
  await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      role: 'editor',
    },
  })
}

process.exit(0)
