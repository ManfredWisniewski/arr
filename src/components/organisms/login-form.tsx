import React from 'react'

import { cx } from '@/lib/cx'

import { Button } from '../atoms/button'
import { Link } from '../atoms/link'
import { Checkbox } from '../molecules/checkbox'
import { TextBlock } from '../molecules/text-block'
import { FormField } from './form-field'

// Login form — email + password fields, remember checkbox, submit and
// auxiliary links (.login-form contract classes). Wrap in a <form>.
export const LoginForm = ({
  className,
  lead,
  links,
  title = 'Anmelden',
}: {
  className?: string
  lead?: string
  links?: { href: string; label: string }[]
  title?: string
}) => (
  <div className={cx('login-form', className)}>
    <TextBlock lead={lead} title={title} />
    <FormField label="E-Mail" name="email" required type="email" />
    <FormField label="Passwort" name="passwort" required type="password" />
    <Checkbox label="Angemeldet bleiben" name="remember" />
    <div className="page-actions">
      <Button type="submit" variant="primary">
        {title}
      </Button>
      {links?.map((link) => (
        <Link href={link.href} key={link.label}>
          {link.label}
        </Link>
      ))}
    </div>
  </div>
)
