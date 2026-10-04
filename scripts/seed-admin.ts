import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'

const email = process.env.PAYLOAD_SEED_ADMIN_EMAIL
const password = process.env.PAYLOAD_SEED_ADMIN_PASSWORD
const apiKey = process.env.PAYLOAD_SEED_ADMIN_API_KEY

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

// optional: pre-provision an API key (local dev convenience)
const apiKeyFields = apiKey ? { enableAPIKey: true, apiKey } : {}

if (existing.totalDocs === 0) {
  await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      role: 'editor',
      ...apiKeyFields,
    },
  })
} else if (apiKey) {
  await payload.update({
    collection: 'users',
    id: existing.docs[0].id,
    data: apiKeyFields,
  })
}

process.exit(0)
