import React from 'react'

import { Button } from '../atoms/button'
import { Checkbox } from '../molecules/checkbox'
import { TextBlock } from '../molecules/text-block'
import { FormField } from '../organisms/form-field'
import type { TemplateProps } from './default'

// Contact-form layout — TextBlock + demo form (FormFields + Checkbox +
// submit Button) + markdown body. The form does a GET round-trip to the
// same URL (demo only — no backend endpoint).
export const ContactTemplate = ({ page, renderBody }: TemplateProps) => (
  <article className="page" data-template="contact">
    <TextBlock
      lead={page.meta?.description ?? undefined}
      title={page.title}
    />
    <form className="contact-form" method="get">
      <FormField label="Name" name="name" required />
      <FormField
        hint="Wird nur für Rückfragen verwendet."
        label="E-Mail"
        name="email"
        required
        type="email"
      />
      <FormField label="Nachricht" name="nachricht" required />
      <Checkbox label="Datenschutz akzeptiert" name="datenschutz" />
      <div className="page-actions">
        <Button type="submit" variant="primary">
          Absenden
        </Button>
      </div>
    </form>
    <div className="page-body">{renderBody(page.content)}</div>
  </article>
)
