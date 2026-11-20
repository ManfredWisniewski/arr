'use client'

import { useEffect } from 'react'

// Cookie-consent bootstrap (D12): mounts the vanilla-cookieconsent
// banner when a consent-gated service exists. The lib is imported
// dynamically — it touches window at module scope, which would break
// SSR of this client component's initial render.
let booted = false

const GTAG_SCRIPT_ID = 'gtag-src'

// Injects the same gtag pair the SSR path emits — used on live accept
// so no reload is needed (A07).
const injectGtag = (id: string) => {
  if (document.getElementById(GTAG_SCRIPT_ID)) {
    return
  }
  const src = document.createElement('script')
  src.id = GTAG_SCRIPT_ID
  src.async = true
  src.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  const init = document.createElement('script')
  init.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(id)})`
  document.head.append(src, init)
}

const de = (privacyPath: string) => ({
  consentModal: {
    title: 'Wir verwenden Cookies',
    description: `Wir nutzen Cookies, um unsere Website optimal zu gestalten. Notwendige Cookies sind für den Betrieb erforderlich; Statistik-Cookies helfen uns zu verstehen, wie die Website genutzt wird. Details in der <a href="${privacyPath}">Datenschutzerklärung</a>.`,
    acceptAllBtn: 'Alle akzeptieren',
    acceptNecessaryBtn: 'Nur notwendige',
    showPreferencesBtn: 'Einstellungen',
    footer: `<a href="${privacyPath}">Datenschutz</a>`,
  },
  preferencesModal: {
    title: 'Cookie-Einstellungen',
    acceptAllBtn: 'Alle akzeptieren',
    acceptNecessaryBtn: 'Nur notwendige',
    savePreferencesBtn: 'Auswahl speichern',
    closeIconLabel: 'Schließen',
    sections: [
      {
        title: 'Ihre Auswahl',
        description:
          'Hier können Sie Ihre Einwilligung zur Nutzung von Cookies anpassen.',
      },
      {
        title: 'Notwendig',
        description:
          'Diese Cookies sind für den Betrieb der Website erforderlich und können nicht abgewählt werden.',
        linkedCategory: 'necessary',
      },
      {
        title: 'Statistik',
        description:
          'Google Analytics hilft uns zu verstehen, wie die Website genutzt wird.',
        linkedCategory: 'analytics',
      },
      {
        title: 'Weitere Informationen',
        description: `Details zur Datenverarbeitung stehen in der <a href="${privacyPath}">Datenschutzerklärung</a>.`,
      },
    ],
  },
})

const en = (privacyPath: string) => ({
  consentModal: {
    title: 'We use cookies',
    description: `We use cookies to optimise this website. Necessary cookies are required for it to work; statistics cookies help us understand how it is used. See our <a href="${privacyPath}">privacy policy</a> for details.`,
    acceptAllBtn: 'Accept all',
    acceptNecessaryBtn: 'Necessary only',
    showPreferencesBtn: 'Settings',
    footer: `<a href="${privacyPath}">Privacy</a>`,
  },
  preferencesModal: {
    title: 'Cookie settings',
    acceptAllBtn: 'Accept all',
    acceptNecessaryBtn: 'Necessary only',
    savePreferencesBtn: 'Save selection',
    closeIconLabel: 'Close',
    sections: [
      {
        title: 'Your choice',
        description: 'Adjust your consent to the use of cookies here.',
      },
      {
        title: 'Necessary',
        description:
          'These cookies are required for the website to work and cannot be disabled.',
        linkedCategory: 'necessary',
      },
      {
        title: 'Statistics',
        description:
          'Google Analytics helps us understand how the website is used.',
        linkedCategory: 'analytics',
      },
      {
        title: 'More information',
        description: `See the <a href="${privacyPath}">privacy policy</a> for details on data processing.`,
      },
    ],
  },
})

export function ConsentManager({
  gaId,
  privacyPath = '/datenschutz',
}: {
  gaId?: string
  privacyPath?: string
}) {
  useEffect(() => {
    if (booted || !gaId) {
      return
    }
    booted = true
    void (async () => {
      const CookieConsent = await import('vanilla-cookieconsent')
      CookieConsent.run({
        autoClearCookies: true,
        cookie: { expiresAfterDays: 182 },
        guiOptions: {
          consentModal: {
            equalWeightButtons: true,
            layout: 'box',
            position: 'bottom right',
          },
          preferencesModal: { equalWeightButtons: true, layout: 'box' },
        },
        categories: {
          necessary: { enabled: true, readOnly: true },
          analytics: {
            autoClear: {
              cookies: [
                { name: /^_ga/ },
                { name: /^_gat/ },
                { name: '_gid' },
              ],
            },
            services: {
              gtag: {
                label: 'Google Analytics',
                onAccept: () => injectGtag(gaId),
              },
            },
          },
        },
        language: {
          autoDetect: 'document',
          default: 'de',
          translations: {
            de: de(privacyPath),
            en: en(privacyPath),
          },
        },
        onConsent: () => {
          // safety net: consent exists but the tag did not render
          // (e.g. stale cached HTML) — injectGtag is idempotent
          if (CookieConsent.acceptedCategory('analytics')) {
            injectGtag(gaId)
          }
        },
        onChange: ({ changedCategories }) => {
          // Withdrawal reloads the page (D12) — but only when the tag
          // actually ran, so a first-visit "necessary only" choice does
          // not reload needlessly.
          if (
            changedCategories?.includes('analytics') &&
            !CookieConsent.acceptedCategory('analytics') &&
            document.getElementById(GTAG_SCRIPT_ID)
          ) {
            window.location.reload()
          }
        },
      })
    })()
  }, [gaId, privacyPath])

  return null
}
