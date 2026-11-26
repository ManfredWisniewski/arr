import type { Config, Plugin } from 'payload'

import type { PluginTemplateOptions } from './types'

// T002 — skeleton Payload plugin for arr (spec
// +wit/specs/arr/plugin-template/, FR-001..FR-007). It is intentionally
// inert: with default options it changes nothing. To build a real plugin,
// copy this folder, rename the factory + slug, and uncomment the extension
// stub you need — every stub follows the documented plugin pattern.
export const pluginTemplate = (options: PluginTemplateOptions = {}): Plugin => {
  const plugin: Plugin = (incomingConfig: Config): Config => {
    // Best practice from the plugin docs: a plugin must be disableable
    // without being uninstalled.
    if (options.enabled === false) {
      return incomingConfig
    }

    // Always spread the incoming config — never build a fresh object.
    const config: Config = { ...incomingConfig }

    // Adding a collection — spread, then append:
    // config.collections = [...(config.collections || []), newCollection]

    // Adding a global — same rule:
    // config.globals = [...(config.globals || []), newGlobal]

    // Extending a collection's fields — map over the incoming collections,
    // spread each collection and its fields array, never mutate in place.

    // Extending hooks — spread the incoming map, append your listener:
    // config.hooks = {
    //   ...(config.hooks || {}),
    //   afterChange: [...(config.hooks?.afterChange || []), myHook],
    // }

    // Function-valued keys can't be spread: invoke the previous function
    // first, then run the plugin's own code.
    config.onInit = async (payload) => {
      if (incomingConfig.onInit) {
        await incomingConfig.onInit(payload)
      }
      payload.logger.info('plugin-template initialized')
    }

    return config
  }

  // Cross-plugin discovery identifier (Payload 3.x, marked @experimental).
  plugin.slug = 'plugin-template'

  return plugin
}

export type { PluginTemplateOptions }
