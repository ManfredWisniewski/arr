import { NavHamburger, NavWrapper } from '@payloadcms/next/client'
import { Logout } from '@payloadcms/ui'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import {
  EntityType,
  type EntityToGroup,
  groupNavItems,
} from '@payloadcms/ui/shared'
import type {
  CustomComponent,
  NavPreferences,
  PayloadRequest,
  SanitizedPermissions,
  ServerProps,
} from 'payload'
import { PREFERENCE_KEYS } from 'payload/shared'
import React from 'react'

import { ReviewNavClient } from './review-nav.client'
import { SettingsMenuButton } from './settings-menu-button.client'

const baseClass = 'nav'

// Vendored DefaultNav (@payloadcms/next ~3.90, dist/elements/Nav/index.js)
// with two deviations: ReviewNavClient injects the "Review new" frontend
// link after `media`, and getNavPrefs is reimplemented inline because it
// is not in the package's public exports. Keep in step on upgrades.
export const ReviewNav = async (
  props: { req?: PayloadRequest } & ServerProps,
) => {
  const {
    documentSubViewType,
    i18n,
    locale,
    params,
    payload,
    permissions,
    req,
    searchParams,
    user,
    viewType,
    visibleEntities,
  } = props
  if (!payload?.config) {
    return null
  }
  const {
    admin: {
      components: {
        afterNav,
        afterNavLinks,
        beforeNav,
        beforeNavLinks,
        logout,
        settingsMenu,
      },
    },
    collections,
    globals,
  } = payload.config

  const groups = groupNavItems(
    [
      ...collections
        .filter(({ slug }) => visibleEntities?.collections.includes(slug))
        .map(
          (collection): EntityToGroup => ({
            entity: collection,
            type: EntityType.collection,
          }),
        ),
      ...globals
        .filter(({ slug }) => visibleEntities?.globals.includes(slug))
        .map(
          (global): EntityToGroup => ({
            entity: global,
            type: EntityType.global,
          }),
        ),
    ],
    permissions ?? ({} as SanitizedPermissions),
    i18n,
  )

  // vendored getNavPrefs: read the nav group open/close preference
  const navPreferences = req?.user?.collection
    ? await req.payload
        .find({
          collection: 'payload-preferences',
          depth: 0,
          limit: 1,
          pagination: false,
          req,
          where: {
            and: [
              { key: { equals: PREFERENCE_KEYS.NAV } },
              { 'user.relationTo': { equals: req.user.collection } },
              { 'user.value': { equals: req.user.id } },
            ],
          },
        })
        .then((res) => (res?.docs?.[0]?.value as NavPreferences) ?? null)
    : null

  const serverProps = {
    i18n,
    locale,
    params,
    payload,
    permissions,
    searchParams,
    user,
  }
  const clientProps = { documentSubViewType, viewType }
  const renderSlot = (
    Component:
      | CustomComponent
      | CustomComponent[]
      | React.ComponentType
      | React.ComponentType[]
      | undefined,
    extra?: Record<string, unknown>,
  ) =>
    RenderServerComponent({
      clientProps,
      Component,
      importMap: payload.importMap,
      serverProps: { ...serverProps, ...extra },
    })

  const LogoutComponent = RenderServerComponent({
    clientProps,
    Component: logout?.Button,
    Fallback: Logout,
    importMap: payload.importMap,
    serverProps,
  })

  const RenderedSettingsMenu =
    settingsMenu && Array.isArray(settingsMenu)
      ? settingsMenu.map((item, index) =>
          RenderServerComponent({
            clientProps,
            Component: item,
            importMap: payload.importMap,
            key: `settings-menu-item-${index}`,
            serverProps,
          }),
        )
      : []

  return (
    <NavWrapper baseClass={baseClass}>
      {renderSlot(beforeNav)}
      <nav className={`${baseClass}__wrap`}>
        {renderSlot(beforeNavLinks)}
        <ReviewNavClient
          canReview={
            (user as { role?: string } | null | undefined)?.role ===
            'editor'
          }
          groups={groups}
          navPreferences={navPreferences}
        />
        {renderSlot(afterNavLinks)}
        <div className={`${baseClass}__controls`}>
          <SettingsMenuButton settingsMenu={RenderedSettingsMenu} />
          {LogoutComponent}
        </div>
      </nav>
      {renderSlot(afterNav)}
      <div className={`${baseClass}__header`}>
        <div className={`${baseClass}__header-content`}>
          <NavHamburger baseClass={baseClass} />
        </div>
      </div>
    </NavWrapper>
  )
}
