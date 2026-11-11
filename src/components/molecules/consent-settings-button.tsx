'use client'

// "Cookie-Einstellungen" — auto-appended to the site footer's legal row
// when the consent banner is enabled (D12); reopens the preferences
// modal for withdrawal (TDDDG).
export function ConsentSettingsButton() {
  return (
    <button
      className="consent-settings"
      onClick={async () => {
        const { showPreferences } = await import('vanilla-cookieconsent')
        showPreferences()
      }}
      type="button"
    >
      Cookie-Einstellungen
    </button>
  )
}
