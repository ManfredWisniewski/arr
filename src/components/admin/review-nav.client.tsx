'use client'

import { getTranslation } from '@payloadcms/translations'
import {
  BrowseByFolderButton,
  Link,
  NavGroup,
  useConfig,
  useTranslation,
} from '@payloadcms/ui'
import { EntityType, type NavGroupType } from '@payloadcms/ui/shared'
import NextLink from 'next/link.js'
import { usePathname } from 'next/navigation.js'
import type { NavPreferences } from 'payload'
import { formatAdminURL } from 'payload/shared'
import React, { Fragment } from 'react'

const baseClass = 'nav'

type NavEntity = NavGroupType['entities'][number]

// Mirrors Payload's DefaultNavClient (@payloadcms/next ~3.90) with one
// addition: a "Review new" link to the frontend /review index is inserted
// directly after the `media` collection entry. Keep in step on upgrades.
export const ReviewNavClient = ({
  canReview,
  groups,
  navPreferences,
  pendingCount,
}: {
  canReview: boolean
  groups: NavGroupType[]
  navPreferences?: NavPreferences | null
  pendingCount: number
}) => {
  const pathname = usePathname()
  const { config } = useConfig()
  const adminRoute = config.routes.admin
  const folders = config.folders
  const foldersRoute = config.admin.routes.browseByFolder
  const { i18n } = useTranslation()

  const viewingRootFolderView = Boolean(
    foldersRoute &&
      pathname.startsWith(
        formatAdminURL({ adminRoute, path: foldersRoute }),
      ),
  )

  const renderEntityLink = ({ label, slug, type }: NavEntity, index: number) => {
    let href: string | undefined
    let id: string | undefined
    if (type === EntityType.collection) {
      href = formatAdminURL({ adminRoute, path: `/collections/${slug}` })
      id = `nav-${slug}`
    }
    if (type === EntityType.global) {
      href = formatAdminURL({ adminRoute, path: `/globals/${slug}` })
      id = `nav-global-${slug}`
    }
    if (!href) {
      return null
    }
    const isActive =
      pathname.startsWith(href) &&
      ['/', undefined].includes(pathname[href.length])
    const Label = (
      <Fragment>
        {isActive ? (
          <div className={`${baseClass}__link-indicator`} />
        ) : null}
        <span className={`${baseClass}__link-label`}>
          {getTranslation(label, i18n)}
        </span>
      </Fragment>
    )
    if (pathname === href) {
      return (
        <div className={`${baseClass}__link`} id={id} key={index}>
          {Label}
        </div>
      )
    }
    return (
      <Link
        className={`${baseClass}__link`}
        href={href}
        id={id}
        key={index}
        prefetch={false}
      >
        {Label}
      </Link>
    )
  }

  return (
    <Fragment>
      {typeof folders === 'object' && folders.browseByFolder ? (
        <BrowseByFolderButton active={viewingRootFolderView} />
      ) : null}
      {groups.map(({ entities, label }, key) => (
        <NavGroup
          isOpen={navPreferences?.groups?.[label]?.open}
          key={key}
          label={label}
        >
          {entities.flatMap((entity, index) => {
            const links = [renderEntityLink(entity, index)]
            if (entity.slug === 'media' && canReview) {
              links.push(
                <NextLink
                  className={`${baseClass}__link`}
                  href="/review"
                  id="nav-review"
                  key="review"
                  prefetch={false}
                >
                  <span className={`${baseClass}__link-label`}>
                    Review new ({pendingCount})
                  </span>
                </NextLink>,
              )
            }
            return links
          })}
        </NavGroup>
      ))}
    </Fragment>
  )
}
