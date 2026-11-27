// @vitest-environment node
import { getPayload, Payload } from 'payload'
import type { Config } from 'payload'
import config from '@/payload.config'
import {
  pluginTemplate,
  type PluginTemplateOptions,
} from '@/plugins/plugin-template'

import { describe, it, beforeAll, expect, vi } from 'vitest'

// T004 — spec +wit/specs/arr/plugin-template/, FR-002/FR-003/FR-005/FR-008.
const incomingConfig = (): Config =>
  ({
    collections: [{ slug: 'things', fields: [] }],
    globals: [{ slug: 'settings', fields: [] }],
    hooks: { afterError: [vi.fn()] },
    onInit: vi.fn(),
  }) as unknown as Config

// Plugin may return a Promise; awaiting narrows the union to Config.
const apply = (options: PluginTemplateOptions, incoming: Config) =>
  Promise.resolve(pluginTemplate(options)(incoming))

describe('plugin-template factory', () => {
  it('returns the config unmodified when disabled', async () => {
    const incoming = incomingConfig()
    const result = await apply({ enabled: false }, incoming)

    expect(result).toBe(incoming)
  })

  it('preserves every incoming config key when enabled', async () => {
    const incoming = incomingConfig()
    const result = await apply({ enabled: true }, incoming)

    expect(result.collections).toEqual(incoming.collections)
    expect(result.globals).toEqual(incoming.globals)
    expect(result.hooks).toEqual(incoming.hooks)
  })

  it('exposes a slug for cross-plugin discovery', () => {
    expect(pluginTemplate({ enabled: true }).slug).toBe('plugin-template')
  })

  it('invokes a pre-existing onInit before its own init code', async () => {
    const incoming = incomingConfig()
    const result = await apply({ enabled: true }, incoming)
    const payload = { logger: { info: vi.fn() } }

    await result.onInit?.(payload as never)

    expect(incoming.onInit).toHaveBeenCalled()
    expect(payload.logger.info).toHaveBeenCalledWith(
      'plugin-template initialized',
    )
    expect(
      vi.mocked(incoming.onInit!).mock.invocationCallOrder[0],
    ).toBeLessThan(payload.logger.info.mock.invocationCallOrder[0])
  })
})

describe('plugin-template wiring', () => {
  let payload: Payload

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('boots with an unchanged collection set', () => {
    expect(Object.keys(payload.collections).sort()).toEqual(
      [
        'job-applications',
        'job-attachments',
        'jobs',
        'media',
        'pages',
        'payload-kv',
        'payload-locked-documents',
        'payload-migrations',
        'payload-preferences',
        'posts',
        'structures',
        'users',
      ].sort(),
    )
  })
})
