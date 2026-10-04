import React from 'react'

import type { Media } from '@/payload-types'

import {
  Avatar,
  Badge,
  Button,
  ColorSwatch,
  Divider,
  Heading,
  Icon,
  Img,
  Input,
  Label,
  Link,
  Paragraph,
  Progress,
  Select,
  Skeleton,
  Spacer,
  Spinner,
  Textarea,
  TypePreview,
} from '@/components/atoms'
import {
  Accordion,
  Alert,
  Breadcrumb,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Dropdown,
  Figure,
  IconBox,
  IconButton,
  InfoText,
  InputGroup,
  MediaObject,
  NavList,
  Pagination,
  Pill,
  Radio,
  RadioGroup,
  SearchField,
  Tabs,
  TagInput,
  TextBlock,
  Toast,
  Toggle,
  UserMenu,
} from '@/components/molecules'
import {
  BadgeGroup,
  CardGrid,
  ChatBubble,
  DashboardWidget,
  DataTable,
  FilterBar,
  FormField,
  FormSection,
  ItemList,
  LeadSection,
  ListItem,
  LoginForm,
  NotificationList,
  OnboardingStep,
  PricingCard,
  Sidebar,
  Timeline,
  Tooltip,
} from '@/components/organisms'

import { DrawerDemo } from './drawer-demo'
import { ModalDemo } from './modal-demo'

// Renders every atom/molecule/organism with fixture props — shared by the
// dev-only /components route and the `showcase` template (demo site).
// `media` is an optional fixture (usually the theme logo).
export const ComponentShowcase = ({ media }: { media?: Media | null }) => (
  <>
    <Heading level={2}>Atoms</Heading>

    <Heading level={3}>Text</Heading>
    <Heading level={2}>Heading 2</Heading>
    <Heading level={3}>Heading 3</Heading>
    <Heading level={4}>Heading 4</Heading>
    <Paragraph>Paragraph — Fließtext mit normalem Satzbild.</Paragraph>
    <Paragraph>
      Badge: <Badge>Neu</Badge> <Badge>SEO</Badge>
    </Paragraph>

    <Heading level={3}>Button</Heading>
    <div className="page-actions">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button size="sm" variant="secondary">
        Small
      </Button>
      <Button size="lg" variant="primary">
        Large
      </Button>
      <Button loading variant="primary">
        Loading
      </Button>
      <Button disabled>Disabled</Button>
      <Button href="/" variant="primary">
        Link-Button
      </Button>
    </div>

    <Heading level={3}>IconButton</Heading>
    <div className="page-actions">
      <IconButton icon="check" variant="primary">
        Speichern
      </IconButton>
      <IconButton icon="external" iconPosition="right" variant="secondary">
        Exportieren
      </IconButton>
      <IconButton href="/elemente" icon="external">
        Weiter
      </IconButton>
    </div>

    <Heading level={3}>Link</Heading>
    <Paragraph>
      <Link href="/">Internal link</Link> ·{' '}
      <Link href="https://witconsult.de">External link</Link>
    </Paragraph>

    <Heading level={3}>Icon</Heading>
    <Paragraph>
      <Icon name="menu" /> menu · <Icon name="close" /> close ·{' '}
      <Icon name="external" /> external · <Icon name="check" /> check ·{' '}
      <Icon name="info" /> info
    </Paragraph>

    <Heading level={3}>Input / Textarea / Select / Label</Heading>
    <Paragraph>
      <Input aria-label="Demo" placeholder="input demo" />
    </Paragraph>
    <Paragraph>
      <Textarea aria-label="Textarea" placeholder="textarea demo" />
    </Paragraph>
    <Paragraph>
      <Select aria-label="Select" defaultValue="">
        <option disabled value="">
          Option wählen …
        </option>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </Select>{' '}
      <Label htmlFor="demo-label" required>
        Label
      </Label>{' '}
      <Input id="demo-label" placeholder="labeled input" />
    </Paragraph>

    <Heading level={3}>Avatar / Progress / Spinner / Skeleton</Heading>
    <Paragraph>
      <Avatar name="Max Mustermann" /> <Avatar name="Anna Beispiel" size="sm" />{' '}
      <Avatar name="Team WIT" size="lg" /> <Spinner /> <Spinner label="Lädt Daten" />
    </Paragraph>
    <Paragraph>
      <Progress max={100} value={40} />
    </Paragraph>
    <Skeleton lines={3} />

    <Heading level={3}>Divider / Spacer</Heading>
    <Paragraph>Text über der Trennlinie.</Paragraph>
    <Divider />
    <Paragraph>Text darunter; danach Spacer sm/md/lg:</Paragraph>
    <Spacer size="sm" />
    <Spacer />
    <Spacer size="lg" />

    <Heading level={3}>ColorSwatch / TypePreview</Heading>
    <Paragraph>
      <ColorSwatch token="component-fill-component-fill-primary" />{' '}
      <ColorSwatch token="component-fill-component-fill-negative-soft" />
    </Paragraph>
    <TypePreview
      sample="Ag — Überschrift"
      size="typography-size-lg-2x"
      weight="typography-weight-semi-bold"
    />

    <Heading level={3}>Image</Heading>
    {media?.url ? (
      <Paragraph>
        <Img alt={media.alt} src={media.url} style={{ maxWidth: '12rem' }} />
      </Paragraph>
    ) : (
      <Paragraph>No media fixture (push a theme logo first).</Paragraph>
    )}

    <Heading level={2}>Molecules</Heading>

    <Heading level={3}>NavList</Heading>
    <NavList
      items={[
        { children: [], label: 'Start', path: '/' },
        {
          children: [
            { children: [], label: 'Unterseite', path: '/bereich/unterseite' },
          ],
          label: 'Bereich',
          path: '/bereich',
        },
      ]}
    />

    <Heading level={3}>TextBlock</Heading>
    <TextBlock
      eyebrow="Eyebrow"
      lead="Lead-Absatz unter der Überschrift — kurzer Einleitungstext."
      title="TextBlock-Titel"
    >
      <p>Body-Inhalt mit weiterem Text.</p>
    </TextBlock>
    <TextBlock
      align="center"
      eyebrow="Zentriert"
      lead="Zentrierte Variante für Section-Intros."
      title="Zentrierter TextBlock"
    />

    <Heading level={3}>IconBox</Heading>
    <Paragraph>
      <IconBox name="info" /> <IconBox name="check" />{' '}
      <IconBox name="external" variant="outline" />{' '}
      <IconBox name="menu" variant="outline" />
    </Paragraph>

    <Heading level={3}>InfoText</Heading>
    <InfoText>Hinweiszeile mit Icon links und Text rechts.</InfoText>
    <InfoText icon="check">Bestätigung mit anderem Icon.</InfoText>

    <Heading level={3}>Pill</Heading>
    <Paragraph>
      <Pill>Tag</Pill> <Pill icon="check">Verifiziert</Pill>{' '}
      <Pill href="/elemente">Kategorie-Link</Pill>
    </Paragraph>

    <Heading level={3}>Toggle</Heading>
    <Paragraph>
      <Toggle label="Aus" /> <Toggle defaultChecked label="An" />{' '}
      <Toggle disabled label="Deaktiviert" />
    </Paragraph>

    <Heading level={3}>Checkbox</Heading>
    <Paragraph>
      <Checkbox label="Option A" /> <Checkbox defaultChecked label="Option B" />{' '}
      <Checkbox disabled label="Deaktiviert" />
    </Paragraph>

    <Heading level={3}>Radio / ChoiceGroup</Heading>
    <Paragraph>
      <Radio label="Monatlich" name="billing" value="monthly" />{' '}
      <Radio defaultChecked label="Jährlich" name="billing" value="yearly" />
    </Paragraph>
    <RadioGroup
      hint="Eine Option wählbar."
      label="Kontaktweg"
      name="contact"
      options={[
        { label: 'E-Mail', value: 'email' },
        { label: 'Telefon', value: 'phone' },
        { label: 'Post', value: 'post' },
      ]}
      values={['email']}
    />
    <CheckboxGroup
      hint="Mehrfachauswahl möglich."
      label="Benachrichtigungen"
      name="notifications"
      options={[
        { label: 'Newsletter', value: 'news' },
        { label: 'Produktupdates', value: 'updates' },
        { disabled: true, label: 'SMS (demnächst)', value: 'sms' },
      ]}
      values={['news']}
    />

    <Heading level={3}>SearchField / InputGroup / ButtonGroup</Heading>
    <Paragraph>
      <SearchField />
    </Paragraph>
    <Paragraph>
      <InputGroup placeholder="benutzername" suffix="@witconsult.de" />{' '}
      <InputGroup placeholder="0,00" prefix="€" />
    </Paragraph>
    <ButtonGroup
      items={[
        { label: 'Abbrechen' },
        { label: 'Speichern', variant: 'primary' },
      ]}
      label="Aktionen"
    />

    <Heading level={3}>TagInput</Heading>
    <TagInput name="tags" tags={['SEO', 'Content']} />

    <Heading level={3}>MediaObject</Heading>
    {media?.url ? (
      <MediaObject
        actions={
          <ButtonGroup items={[{ label: 'Profil', variant: 'secondary' }]} />
        }
        mediaAlt="Logo"
        mediaSrc={media.url}
        title="Media Object"
      >
        <p>Bild links, Titel und Text rechts, optionale Aktionen.</p>
      </MediaObject>
    ) : (
      <Paragraph>No media fixture (push a theme logo first).</Paragraph>
    )}

    <Heading level={3}>Alert / Toast</Heading>
    <Alert tone="info">Info-Meldung mit Icon.</Alert>
    <Alert dismissible tone="positive">
      Erfolg — schließbar.
    </Alert>
    <Alert tone="warning">Warnung ohne Schließen-Button.</Alert>
    <Alert dismissible tone="negative">
      Fehler-Meldung.
    </Alert>
    <Toast duration={8000} tone="info">
      Toast — fixed unten rechts, schließt nach 8 s.
    </Toast>

    <Heading level={3}>Pagination / Breadcrumb</Heading>
    <Pagination current={2} hrefFor={(page) => `/seite/${page}`} total={5} />
    <Breadcrumb
      items={[
        { label: 'Start', path: '/' },
        { label: 'Bereich', path: '/bereich' },
        { label: 'Unterseite' },
      ]}
    />

    <Heading level={3}>Tabs / Accordion</Heading>
    <Tabs
      items={[
        { content: <p>Inhalt des ersten Tabs.</p>, label: 'Tab eins' },
        {
          content: <p>Inhalt mit Icon-Tab.</p>,
          icon: 'info',
          label: 'Tab zwei',
        },
      ]}
    />
    <Accordion
      items={[
        { content: <p>Antwort auf Frage eins.</p>, title: 'Frage eins' },
        { content: <p>Antwort auf Frage zwei.</p>, title: 'Frage zwei' },
      ]}
    />

    <Heading level={3}>Dropdown / UserMenu</Heading>
    <Paragraph>
      <Dropdown
        items={[
          { href: '/elemente', label: 'Eintrag eins' },
          { href: '/bereich', label: 'Eintrag zwei' },
        ]}
        label="Menü öffnen"
      />{' '}
      <UserMenu
        badge="Admin"
        items={[
          { href: '/profil', label: 'Profil' },
          { href: '/einstellungen', label: 'Einstellungen' },
          { href: '/logout', label: 'Abmelden' },
        ]}
        name="Max Mustermann"
        role="Redakteur"
      />
    </Paragraph>

    <Heading level={3}>Figure</Heading>
    {media ? (
      <Figure media={{ ...media, caption: 'Figure caption (theme logo)' }} />
    ) : (
      <Paragraph>No media fixture (push a theme logo first).</Paragraph>
    )}

    <Heading level={2}>Organisms</Heading>

    <Heading level={3}>CardGrid</Heading>
    <CardGrid
      items={[
        {
          description: 'Karte mit IconBox, Titel, Text und Link.',
          href: '/elemente',
          icon: 'info',
          linkLabel: 'Details',
          title: 'Karte eins',
        },
        {
          description: 'Karte ohne Link.',
          icon: 'check',
          title: 'Karte zwei',
        },
        {
          description: 'Karte ohne Icon.',
          title: 'Karte drei',
        },
        {
          badge: 'Neu',
          description: 'Karte mit Badge und Media-Header.',
          mediaAlt: 'Logo',
          mediaSrc: media?.url ?? undefined,
          title: 'Karte vier',
        },
      ]}
    />

    <Heading level={3}>FormField</Heading>
    <FormField
      hint="Wird nur für Rückfragen verwendet."
      label="E-Mail"
      name="email"
      placeholder="name@beispiel.de"
      type="email"
    />
    <FormField
      error="Pflichtfeld — bitte ausfüllen."
      label="Name"
      name="name"
      required
    />

    <Heading level={3}>BadgeGroup</Heading>
    <BadgeGroup
      items={[
        { label: 'SEO' },
        { icon: 'check', label: 'Verifiziert' },
        { href: '/elemente', label: 'Kategorie' },
      ]}
      label="Themen:"
    />

    <Heading level={3}>ListItem</Heading>
    <ItemList>
      <ListItem
        description="Mit IconBox und Beschreibung"
        icon="info"
        title="Einfacher Eintrag"
      />
      <ListItem
        description="Titel ist verlinkt"
        href="/elemente"
        icon="external"
        title="Link-Eintrag"
      />
      <ListItem
        action={<Toggle label="Aktiv" />}
        icon="check"
        title="Eintrag mit Toggle-Action"
      />
    </ItemList>

    <Heading level={3}>LeadSection</Heading>
    <LeadSection
      actions={[
        { href: '/elemente', label: 'Mehr erfahren', variant: 'primary' },
        { href: '/bereich', icon: 'external', label: 'Kontakt' },
      ]}
      badges={[{ label: 'SEO' }, { icon: 'check', label: 'Audit' }]}
      eyebrow="Leistungen"
      lead="Mehrzweck-Leadblock mit Badges, TextBlock und Aktionen."
      title="LeadSection-Beispiel"
    />

    <Heading level={3}>Tooltip</Heading>
    <Paragraph>
      Text mit <Tooltip text="Kurzer erklärender Hinweis.">Tooltip</Tooltip>{' '}
      und{' '}
      <Tooltip position="bottom" text="Tooltip unter dem Element.">
        <Button variant="secondary">Button mit Tooltip</Button>
      </Tooltip>
    </Paragraph>

    <Heading level={3}>Modal / Drawer</Heading>
    <div className="page-actions">
      <ModalDemo />
      <DrawerDemo />
    </div>

    <Heading level={3}>DataTable</Heading>
    <DataTable
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status' },
        { key: 'action', label: 'Aktion' },
      ]}
      rows={[
        {
          action: <Link href="/bearbeiten">Bearbeiten</Link>,
          name: 'Seite A',
          status: <Badge>Aktiv</Badge>,
        },
        {
          action: <Link href="/bearbeiten">Bearbeiten</Link>,
          name: 'Seite B',
          status: 'Entwurf',
        },
      ]}
    />

    <Heading level={3}>Sidebar</Heading>
    <Sidebar
      sections={[
        {
          items: [
            { children: [], label: 'Start', path: '/' },
            { children: [], label: 'Bereich', path: '/bereich' },
          ],
          title: 'Hauptmenü',
        },
        {
          items: [{ children: [], label: 'Einstellungen', path: '/settings' }],
          title: 'Verwaltung',
        },
      ]}
    />

    <Heading level={3}>DashboardWidget</Heading>
    <DashboardWidget
      actions={<Link href="/details">Details</Link>}
      footer="Aktualisiert vor 5 Minuten"
      title="Aufrufe"
    >
      <Paragraph>
        <strong>1.234</strong> Aufrufe diese Woche
      </Paragraph>
    </DashboardWidget>

    <Heading level={3}>ChatBubble / Kommentar</Heading>
    <ChatBubble
      author="Anna Beispiel"
      text="Könnten wir das morgen besprechen?"
      time="09:41"
    />
    <ChatBubble
      actions={
        <ButtonGroup
          items={[
            { label: 'Antworten', variant: 'secondary' },
            { label: 'Bearbeiten', variant: 'ghost' },
          ]}
        />
      }
      author="Max Mustermann"
      own
      text="Klar, gerne — wie wäre es um 14 Uhr?"
      time="09:43"
    />

    <Heading level={3}>NotificationList</Heading>
    <NotificationList
      items={[
        { text: 'Backup abgeschlossen', time: 'vor 1 Std.', tone: 'positive' },
        { text: 'Neue Anmeldung', time: 'vor 2 Std.', tone: 'info' },
        { text: 'Speicher fast voll', time: 'gestern', tone: 'warning' },
      ]}
    />

    <Heading level={3}>FilterBar</Heading>
    <FilterBar
      buttons={[{ label: 'Zurücksetzen', variant: 'secondary' }]}
      selects={[
        {
          name: 'status',
          options: [
            { label: 'Aktiv', value: 'aktiv' },
            { label: 'Entwurf', value: 'entwurf' },
          ],
          placeholder: 'Status',
        },
      ]}
    />

    <Heading level={3}>OnboardingStep</Heading>
    <OnboardingStep
      actions={[
        { href: '/weiter', label: 'Weiter', variant: 'primary' },
        { label: 'Überspringen', variant: 'secondary' },
      ]}
      lead="Kurze Erklärung zu diesem Schritt."
      media={media}
      step={2}
      title="Profil einrichten"
      total={4}
    />

    <Heading level={3}>PricingCard</Heading>
    <div className="page-actions">
      <PricingCard
        cta={{ href: '/kontakt', label: 'Anfragen' }}
        features={['Basis-Analyse', 'Monatsreport', 'E-Mail-Support']}
        name="Basis"
        period="/ Monat"
        price="499 €"
      />
      <PricingCard
        badge="Beliebt"
        cta={{ href: '/kontakt', label: 'Anfragen' }}
        features={[
          'Alles aus Basis',
          'Wöchentliches Reporting',
          'Persönlicher Ansprechpartner',
        ]}
        name="Pro"
        period="/ Monat"
        price="999 €"
      />
    </div>

    <Heading level={3}>Timeline</Heading>
    <Timeline
      items={[
        {
          description: 'Projektantrag eingereicht',
          status: 'done',
          title: 'Anfrage',
        },
        {
          description: 'Angebot erstellt und versendet',
          status: 'current',
          title: 'Angebot',
        },
        { description: 'Kick-off Termin', title: 'Start' },
      ]}
    />

    <Heading level={3}>FormSection</Heading>
    <FormSection
      actions={[
        { label: 'Abbrechen', variant: 'secondary' },
        { label: 'Speichern', variant: 'primary' },
      ]}
      lead="Sektion mehrerer FormFields mit Aktionen."
      title="Kontaktdaten"
    >
      <FormField label="Name" name="demo-name" required />
      <FormField
        as="select"
        label="Anliegen"
        name="demo-topic"
        options={[
          { label: 'Allgemein', value: 'allgemein' },
          { label: 'SEO', value: 'seo' },
        ]}
      />
      <FormField
        as="textarea"
        hint="Max. 500 Zeichen."
        label="Nachricht"
        name="demo-message"
      />
    </FormSection>

    <Heading level={3}>LoginForm</Heading>
    <form method="get">
      <LoginForm
        lead="Melden Sie sich mit Ihrem Konto an."
        links={[{ href: '/passwort-vergessen', label: 'Passwort vergessen?' }]}
      />
    </form>

    <Paragraph>
      SiteHeader, SiteFooter and the theme toggle frame this page.
    </Paragraph>
  </>
)
