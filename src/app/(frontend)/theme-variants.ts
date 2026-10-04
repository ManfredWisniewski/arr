import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export type ThemeVariant = { name: string; css: string }

// Dev only: expose every compiled biti theme (arr/trurl/wit × light/dark)
// as a selectable variant for design testing. Light builds carry a
// `:root, [data-theme="x-light"]` selector pair, dark builds use
// `[data-theme="dark"]` — both are re-scoped to the file stem so a
// `data-theme` attribute on <html> picks the variant. The `theme` global's
// pushed CSS stays the default (`:root` + `[data-theme="dark"]`).
export function getThemeVariants(): ThemeVariant[] {
  if (process.env.NODE_ENV === 'production') {
    return []
  }
  const dir =
    process.env.THEME_VARIANTS_DIR ??
    path.resolve(process.cwd(), 'biti/tokens/build/css')
  try {
    return readdirSync(dir)
      .filter((file) => /-(light|dark)\.css$/.test(file))
      .sort()
      .map((file) => {
        const name = file.replace(/\.css$/, '')
        const css = readFileSync(path.join(dir, file), 'utf8')
          .replace(/:root\s*,\s*/g, '')
          .replaceAll('[data-theme="dark"]', `[data-theme="${name}"]`)
        return { name, css }
      })
  } catch {
    return []
  }
}
