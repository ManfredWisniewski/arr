// T001 — options accepted by the pluginTemplate factory
// (spec +wit/specs/arr/plugin-template/, FR-001/FR-002). Copied plugins keep
// this file and extend it; document every option with a JSDoc @default.
export interface PluginTemplateOptions {
  /**
   * Enable or disable the plugin without uninstalling it.
   * @default true
   */
  enabled?: boolean
}
