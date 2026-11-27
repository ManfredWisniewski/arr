// T001 — options accepted by the jobs factory
// (spec +wit/specs/arr/jobs/, FR-004/FR-011/FR-013).
export interface JobsOptions {
  /**
   * Enable or disable the plugin without uninstalling it.
   * @default true
   */
  enabled?: boolean
  /**
   * Public route that renders the job list when no document claims it.
   * @default '/karriere'
   */
  basePath?: string
  /**
   * Public POST path of the apply endpoint.
   * @default '/jobs-apply'
   */
  applyPath?: string
  /**
   * Notification recipient when a job carries no `applicationEmail`.
   */
  defaultApplicationEmail?: string
  /**
   * Max CV size in bytes.
   * @default 5242880 (5 MiB)
   */
  attachmentMaxSize?: number
  /**
   * Allowed CV MIME types.
   * @default ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
   */
  attachmentMimeTypes?: string[]
}

// Options with all defaults applied — populated by the factory and read by
// frontend code that cannot receive plugin options directly (routes live
// outside the plugin).
export interface ResolvedJobsOptions extends Required<
  Omit<JobsOptions, 'defaultApplicationEmail'>
> {
  defaultApplicationEmail?: string
}
