import type { Config, Plugin } from 'payload'

import { JobApplications } from './collections/JobApplications'
import { JobAttachments } from './collections/JobAttachments'
import { Jobs } from './collections/Jobs'
import type { JobsOptions, ResolvedJobsOptions } from './types'

// Resolved options with defaults applied — frontend routes live outside
// the plugin and read this object instead of receiving options directly.
// Populated at module load with defaults; the factory merges user options
// when the plugin is registered in payload.config.ts.
export const jobsPluginOptions: ResolvedJobsOptions = {
  enabled: true,
  basePath: '/karriere',
  applyPath: '/jobs-apply',
  attachmentMaxSize: 5 * 1024 * 1024,
  attachmentMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
}

// T002 — jobs plugin (spec +wit/specs/arr/jobs/, FR-001/FR-013): Payload
// mirror of the WP "Job Postings" plugin. Built on the plugin-template
// contract — disableable, spread-safe, onInit preserved.
export const jobs = (options: JobsOptions = {}): Plugin => {
  Object.assign(jobsPluginOptions, options)

  const plugin: Plugin = (incomingConfig: Config): Config => {
    if (options.enabled === false) {
      return incomingConfig
    }

    const config: Config = { ...incomingConfig }

    config.collections = [
      ...(config.collections || []),
      Jobs,
      JobApplications,
      JobAttachments,
    ]

    config.onInit = async (payload) => {
      if (incomingConfig.onInit) {
        await incomingConfig.onInit(payload)
      }
      payload.logger.info('jobs initialized')
    }

    return config
  }

  plugin.slug = 'jobs'

  return plugin
}

export type { JobsOptions }
