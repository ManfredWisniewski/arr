import { createNavigation } from 'next-intl/navigation'

import { routing } from './routing'

// Locale-aware navigation primitives; `Link` prepends the active locale
// prefix to internal hrefs, so callers keep passing unprefixed CMS paths.
export const { getPathname, Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
