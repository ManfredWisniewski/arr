'use client'

import { GearIcon, Popup, useTranslation } from '@payloadcms/ui'
import React from 'react'

const baseClass = 'settings-menu-button'

// Reimplementation of Payload's SettingsMenuButton (@payloadcms/next
// ~3.90) — not in the package exports. Renders the gear popup only when
// settingsMenu items are configured; this repo currently sets none.
export const SettingsMenuButton = ({
  settingsMenu,
}: {
  settingsMenu?: React.ReactNode[]
}) => {
  const { t } = useTranslation()
  if (!settingsMenu || settingsMenu.length === 0) {
    return null
  }
  return (
    <Popup
      button={<GearIcon ariaLabel={t('general:menu')} />}
      className={baseClass}
      horizontalAlign="left"
      id="settings-menu"
      size="small"
      verticalAlign="bottom"
    >
      {settingsMenu.map((item) => item)}
    </Popup>
  )
}
