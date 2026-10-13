import { useTranslations } from 'next-intl'
import React from 'react'

export default function NotFound() {
  const t = useTranslations('notFound')
  return (
    <article className="page">
      <h1>{t('title')}</h1>
      <p>{t('message')}</p>
    </article>
  )
}
