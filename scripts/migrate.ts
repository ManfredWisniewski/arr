import config from '../src/payload.config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
await payload.db.migrate()
process.exit(0)
