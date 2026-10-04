# Fill atomic component structure

## Design System Components (Atoms, Molecules, Organisms)

| Level | Component | Description | Composition (lower-level items) |
|-------|-----------|-------------|---------------------------------|
| **Atom** | Button | Primary interactive element for triggering actions such as submitting forms, confirming dialogs, or initiating workflows. Supports variants (primary, secondary, ghost), sizes, loading and disabled states, and optional icons. | — (atomic) |
| **Atom** | Link | Text-based navigation element that directs users to another page, section, or external URL. Should be used for any action whose main purpose is navigation rather than triggering in-page behavior. | — (atomic) |
| **Atom** | Input | Single-line text field for capturing user data (e.g., name, email, search queries). Includes states for default, focus, error, and disabled, and supports prefixes/suffixes like icons or units. | — (atomic) |
| **Atom** | Textarea | Multi-line text input for longer user entries such as comments, descriptions, or messages. Supports resizable or fixed height, character limits, and validation states. | — (atomic) |
| **Atom** | Select / Dropdown | Compact control for choosing one option from a list. Opens a menu of options on interaction and displays the selected value. Useful when screen space is limited and the option set is moderate in size. | — (atomic) |
| **Atom** | Checkbox | Binary toggle for independent on/off choices, often used in forms for accepting terms, enabling features, or selecting multiple items in a list. Supports indeterminate state for partial selection. | — (atomic) |
| **Atom** | Radio | Single-choice option within a mutually exclusive group. Only one radio in a group can be selected at a time, making it suitable for settings like payment method or plan selection. | — (atomic) |
| **Atom** | Toggle / Switch | Visual on/off control for settings or preferences, often used in dashboards and settings panels. Provides a clear, immediate representation of a boolean state. | — (atomic) |
| **Atom** | Label | Text descriptor associated with form controls (inputs, checkboxes, radios) to explain their purpose. Critical for accessibility, as it binds semantic meaning to interactive elements. | — (atomic) |
| **Atom** | Icon | Small symbolic graphic used to reinforce meaning, indicate actions, or decorate UI elements. Should be consistent in style, size, and color usage across the system. | — (atomic) |
| **Atom** | Avatar | Circular or rounded image representing a user, team, or entity. Often includes fallback initials or a default graphic when no image is available. Used in headers, comments, and lists. | — (atomic) |
| **Atom** | Badge / Tag | Small, compact label for status, categorization, or counts (e.g., “New”, “Error”, “3”). Typically high-contrast and used inside cards, tables, nav items, and buttons. | — (atomic) |
| **Atom** | Tooltip trigger | Invisible or subtle wrapper that attaches a contextual help tooltip to an element. The atom itself is the trigger area; the full tooltip (with content) is usually a molecule or organism. | — (atomic) |
| **Atom** | Divider / Separator | Visual line or spacing element that separates content sections, menu groups, or list items without adding semantic hierarchy. | — (atomic) |
| **Atom** | Spacer | Invisible layout atom that enforces consistent spacing between elements according to the system’s spacing scale. | — (atomic) |
| **Atom** | Heading (H1–H6) | Semantic typography atoms for page and section titles. Each level encodes hierarchy and should map to proper HTML heading tags for accessibility and SEO. | — (atomic) |
| **Atom** | Paragraph / Text | Body text atom for general content. Supports different weights, sizes, and line heights defined by the type scale, and is the default container for copy. | — (atomic) |
| **Atom** | Progress bar (atomic) | Simple linear or circular indicator showing completion percentage for a single process. Used for uploads, form progress, or step completion at a granular level. | — (atomic) |
| **Atom** | Spinner / Loader | Small animated indicator that a process is in progress. Used inside buttons, overlays, or inline where a task is loading but does not block the entire view. | — (atomic) |
| **Atom** | Skeleton (atomic block/line) | Placeholder shape that mimics content structure while data is loading. Helps reduce perceived load time and layout shift compared to blank space. | — (atomic) |
| **Atom** | Image (atomic wrapper) | Basic image container with props for aspect ratio, object fit, alt text, and optional loading states. Serves as the foundation for more complex media molecules and organisms. | — (atomic) |
| **Atom** | Color swatch | Small preview box displaying a design token color. Used in documentation, theme pickers, and admin UIs to visualize and select colors. | — (atomic) |
| **Atom** | Typography token preview | Optional atom that shows a type token (font family, size, weight) in context, mainly for design system docs and theme configuration screens. | — (atomic) |
| **Molecule** | Form field | Combines Label, Input (or other control), and optional helper/error text into a single, reusable unit. Ensures consistent spacing, validation messaging, and accessibility bindings across all forms. | Label + Input/Select/Textarea/Checkbox/Radio + optional helper text + optional error text |
| **Molecule** | Search field | Composed of an Input, Search icon, and often a clear or submit button. Provides a ready-to-use search experience for headers, sidebars, and list views. | Input + Icon (search) + optional Button (clear/submit) |
| **Molecule** | Nav item / Nav link | Combines a Link (or Button for actions), optional Icon, and optional Badge to create a consistent navigation entry. Used in sidebars, top navs, and menus. | Link or Button + optional Icon + optional Badge |
| **Molecule** | Button group | Horizontal or vertical arrangement of multiple Button atoms with consistent spacing and alignment. Used for related actions like “Save / Cancel” or filter toggles. | 2+ Button atoms |
| **Molecule** | Input group | Wraps an Input with prefix/suffix text or icons and optionally a Button (e.g., “Enter” or “Go”). Common in search bars, URL fields, and compact forms. | Input + optional prefix Icon/Text + optional suffix Icon/Text + optional Button |
| **Molecule** | Checkbox group | Logical grouping of multiple Checkbox atoms with a shared context (e.g., “Notification preferences”). Manages layout, spacing, and optionally a group label. | Label (group-level) + 2+ Checkbox atoms (+ optional helper/error text) |
| **Molecule** | Radio group | Set of Radio atoms representing mutually exclusive options under a shared label (e.g., “Billing frequency”). Ensures correct name binding and layout consistency. | Label (group-level) + 2+ Radio atoms (+ optional helper/error text) |
| **Molecule** | Tag input | Combines an Input with a dynamic list of Badge/Tag atoms to allow users to add/remove tags (e.g., skills, topics). Handles entry validation and visual tagging behavior. | Input + 0+ Badge/Tag atoms + optional helper/error text |
| **Molecule** | Card header | Top section of a card containing a Heading, optional Subtext, and optional Avatar/Icon. Provides consistent titling and context for all card-based components. | Heading + optional Paragraph/Subtext + optional Avatar or Icon |
| **Molecule** | Card body | Main content area of a card, typically containing Paragraph text, Images, Badges, or small lists. Encapsulates the core information the card communicates. | 1+ Paragraph/Text atoms + optional Image + optional Badge/Tag + optional List |
| **Molecule** | Card footer | Bottom section of a card with action elements such as Button groups, Links, or metadata (e.g., timestamps). Standardizes how actions and secondary info appear on cards. | Button group and/or Link atoms + optional Paragraph (metadata) |
| **Molecule** | Media object | Layout combining an Image/Avatar on one side with a Text block (title, description, actions) on the other. Common in comment lists, user profiles, and product rows. | Image or Avatar + Heading + Paragraph + optional Button/Link atoms |
| **Molecule** | Alert / Banner | Contextual message component combining an Icon, Text, and optional Close button to communicate status, warnings, or errors. Used inline or at the top of pages. | Icon + Heading + Paragraph + optional Button (close/action) |
| **Molecule** | Toast | Compact notification molecule with Icon, Text, and optional Action link/button for brief system messages (success, error, info). Usually appears in a fixed corner and auto-dismisses. | Icon + Paragraph/Text + optional Button or Link |
| **Molecule** | Pagination item | Represents a single page number or navigation control (“Previous”, “Next”) in a pagination bar. Combines a Button or Link with text and active/disabled states. | Button or Link + optional Icon + Text |
| **Molecule** | Breadcrumb item | Single segment of a breadcrumb trail, typically a Link plus a separator. Helps users understand their location within a hierarchy and navigate upward. | Link + optional Separator (Divider/Icon) + Text |
| **Molecule** | Tabs trigger | Clickable tab label combining a Button/Link, Text, and optional Icon. Part of a tab list that switches visible content panels without navigating away. | Button or Link + Text + optional Icon |
| **Molecule** | Accordion header | Expand/collapse control for an accordion section, consisting of a Button, Text title, and an Icon indicating state. Manages visibility of associated content. | Button + Heading or Paragraph + Icon (chevron/arrow) |
| **Molecule** | Modal header | Top bar of a modal dialog containing a Heading and a Close button. Provides context for the modal’s purpose and a clear exit point. | Heading + Button (close, often icon-only) |
| **Molecule** | Dropdown trigger | Button (often with Icon and text) that opens a dropdown menu. Separates the trigger UI from the dropdown panel, which may be an organism. | Button + Text + optional Icon |
| **Molecule** | User menu trigger | Compact combination of Avatar, optional Name/Role text, and optional Badge, used to open a user-related dropdown (profile, settings, logout). | Avatar + optional Paragraph/Text (name/role) + optional Badge |
| **Organism** | Header / Navbar | Top-level navigation bar combining Logo, Nav items, Search molecule, and User menu. Provides global navigation, search, and account access across the application. | Logo (Image/Icon) + 2+ Nav item molecules + optional Search field molecule + User menu trigger molecule |
| **Organism** | Footer | Bottom page section containing grouped Links (sitemap, legal), social icons, newsletter signup form, and copyright text. Ensures consistent closing structure on all pages. | Multiple Link atoms + Icon atoms (social) + Form section (Form field molecules + Button) + Paragraph (copyright) |
| **Organism** | Sidebar / Navigation panel | Persistent or collapsible navigation area with grouped Nav items, section headers, and optional search or filter. Used for app shells, dashboards, and documentation sites. | Section Headings + 2+ Nav item molecules + optional Search field molecule + optional Divider atoms |
| **Organism** | Hero section | Prominent introductory section with Heading, Subtext, CTA button group, and optional Media (image, illustration, video). Typically the first visual block on landing pages. | Heading + Paragraph/Subtext + Button group molecule + optional Image/Illustration atom |
| **Organism** | Product card | Complete card for displaying a product or item: Image, Card header (title, price, badges), Card body (description, specs), and Card footer (actions like “Add to cart”). | Image + Card header molecule + Card body molecule + Card footer molecule (with Button/Link atoms) |
| **Organism** | Content card | Generic content card used for articles, features, or summaries. Combines Image/Icon, Heading, Text, and action links/buttons in a reusable layout. | Image or Icon + Heading + Paragraph + Card footer molecule (Link/Button atoms) |
| **Organism** | Data table | Full table component with header row, body rows (often molecules), sorting, selection, and Pagination molecule. Used for listing records, logs, or inventory. | Table header cells (Heading atoms) + Table row molecules (cells with Text/Link/Button atoms) + Pagination molecule |
| **Organism** | Form section | Logical grouping of multiple Form field molecules with a section heading and a Button group for actions (Save, Cancel). Structures complex forms into manageable blocks. | Heading + 2+ Form field molecules + Button group molecule |
| **Organism** | Registration / Login form | Complete authentication form composed of Form fields (email, password, etc.), action buttons, and auxiliary links (forgot password, sign up). Encapsulates a full user flow. | 2+ Form field molecules + Button group molecule + Link atoms (auxiliary) |
| **Organism** | Dashboard widget | Self-contained panel on a dashboard showing a specific metric or feature: header (title, actions), content (stats, list, or chart placeholder), and optional footer. | Card header molecule + Card body molecule (stats/list) + optional Card footer molecule |
| **Organism** | Comment list item | Full comment entry with Avatar, Author name, Timestamp, Text content, and action links (reply, edit, delete). Used in threads, tickets, and discussion views. | Avatar + Heading (author) + Paragraph (timestamp) + Paragraph (content) + Link/Button atoms (actions) |
| **Organism** | Chat message bubble | Complete message unit in a chat interface: Avatar, Meta (sender, time), Text content, and optional actions (react, reply, delete). | Avatar + Heading/Paragraph (sender/time) + Paragraph (message text) + optional Button/Link atoms (actions) |
| **Organism** | Modal dialog | Full-screen or centered overlay with Modal header, scrollable Body content (forms, confirmations, details), and Footer actions (Confirm, Cancel). Blocks interaction with the rest of the UI until resolved. | Modal header molecule + Card body molecule (or Form section) + Card footer molecule (Button group) |
| **Organism** | Drawer / Side panel | Slide-in panel anchored to an edge of the screen, with Header, scrollable content area, and Footer actions. Used for details, filters, or multi-step flows without leaving the page. | Modal header molecule + Card body molecule (scrollable content) + Card footer molecule (Button group) |
| **Organism** | Notification center / Inbox list | Panel or page showing a list of notifications or messages (each often a Toast/Alert-like item) with actions like “Mark as read”, “Dismiss”, or “Open”. | Heading + List of Alert/Toast-like molecules + optional Button/Link atoms (bulk actions) |
| **Organism** | Filter bar | Horizontal control area combining Search field, Dropdowns, Button groups, and Tags to refine lists or tables. Common in dashboards, admin panels, and e-commerce. | Search field molecule + 1+ Select/Dropdown molecules + Button group molecule + 0+ Badge/Tag atoms |
| **Organism** | Onboarding step | Full step in a multi-step onboarding flow: Heading, instructional Text, Media or illustration, CTA buttons, and Progress indicator. Guides users through setup or learning. | Heading + Paragraph + Image/Illustration + Button group molecule + Progress bar atom/molecule |
| **Organism** | Pricing card | Marketing component presenting a plan: Header (plan name, badge), Feature list, Price display, and CTA button. Used on pricing pages to compare tiers. | Card header molecule (Heading + Badge) + List (Paragraph atoms) + Heading (price) + Button atom |
| **Organism** | Timeline / Stepper | Visual sequence of steps or events with labels, status indicators (completed, current, upcoming), and optional descriptions. Used for workflows, order tracking, and roadmaps. | 2+ Step item molecules (Icon/Badge + Heading + Paragraph) + optional Connector lines (Divider atoms) |
| **Organism** | Gallery grid | Responsive grid of media or card organisms (images, product cards, articles) with consistent spacing and interaction patterns. Used for portfolios, catalogs, and media libraries. | 2+ Content card or Product card organisms + Spacer/Divider atoms for spacing |

## Implemented vs. catalog

Tier placement notes: standalone controls (Checkbox, Radio, Toggle) are
atoms in the catalog but implemented as **molecules** in arr because
they compose a native input + styled indicator + label. "Badge/Tag"
maps to `Badge` (atom) + `Pill` (molecule). "Form field" is an
organism here (label + control + message unit). "Tooltip trigger" and
the tooltip itself are one `Tooltip` organism. "Comment list item" is
covered by `ChatBubble` (same composition: Avatar + meta + text +
actions slot).

| Implemented (file) | Catalog row | Tier (impl.) |
|---|---|---|
| `atoms/button.tsx` | Button — variants primary/secondary/ghost, sizes sm/lg, loading (Spinner) + disabled, link variant | Atom |
| `atoms/link.tsx` | Link (internal next/link vs external anchor) | Atom |
| `atoms/input.tsx` | Input | Atom |
| `atoms/textarea.tsx` | Textarea | Atom |
| `atoms/select.tsx` | Select/Dropdown (native `<select>`) | Atom |
| `atoms/label.tsx` | Label (+ required marker) | Atom |
| `atoms/icon.tsx` | Icon (registry: check, chevrons, close, external, info, menu, plus, search, user, warning) | Atom |
| `atoms/avatar.tsx` | Avatar (initials fallback, sm/lg) | Atom |
| `atoms/text.tsx` — Badge | Badge/Tag | Atom |
| `atoms/divider.tsx` | Divider/Separator (`<hr>`) | Atom |
| `atoms/spacer.tsx` | Spacer (sm/md/lg) | Atom |
| `atoms/text.tsx` — Heading | Heading (H1–H6) | Atom |
| `atoms/text.tsx` — Paragraph/Lead | Paragraph/Text | Atom |
| `atoms/progress.tsx` | Progress bar (native `<progress>`) | Atom |
| `atoms/spinner.tsx` | Spinner/Loader | Atom |
| `atoms/skeleton.tsx` | Skeleton (block + `lines`) | Atom |
| `atoms/image.tsx` — Img | Image | Atom |
| `atoms/color-swatch.tsx` | Color swatch (token preview) | Atom |
| `atoms/type-preview.tsx` | Typography token preview | Atom |
| `atoms/site-logo.tsx`, `theme-toggle.tsx` | — | Atom |
| `organisms/form-field.tsx` | Form field (Label + Input/Textarea/Select via `as` + hint/error) | Organism |
| `molecules/search-field.tsx` | Search field | Molecule |
| `molecules/nav-item.tsx` — NavList | Nav item/Nav link | Molecule |
| `molecules/button-group.tsx` | Button group | Molecule |
| `molecules/input-group.tsx` | Input group (prefix/suffix addons) | Molecule |
| `molecules/choice-group.tsx` — CheckboxGroup | Checkbox group | Molecule |
| `molecules/choice-group.tsx` — RadioGroup | Radio group | Molecule |
| `molecules/tag-input.tsx` | Tag input (Pills + add/remove) | Molecule |
| `molecules/card-section.tsx` | Card header / Card body / Card footer / CardMedia | Molecule |
| `molecules/media-object.tsx` | Media object | Molecule |
| `molecules/alert.tsx` | Alert/Banner (info/positive/negative/warning, dismissible) | Molecule |
| `molecules/toast.tsx` | Toast (fixed corner, auto-dismiss) | Molecule |
| `molecules/pagination.tsx` | Pagination (+ item states) | Molecule |
| `molecules/breadcrumb.tsx` | Breadcrumb (+ item separators, aria-current) | Molecule |
| `molecules/tabs.tsx` | Tabs trigger + panels (tablist/tab/tabpanel) | Molecule |
| `molecules/accordion.tsx` | Accordion header + body (`<details>`) | Molecule |
| `molecules/dropdown.tsx` | Dropdown trigger + menu (`<details>`) | Molecule |
| `molecules/user-menu.tsx` | User menu trigger (Avatar + name/role + Badge → Dropdown) | Molecule |
| `molecules/checkbox.tsx` | Checkbox | Molecule |
| `molecules/radio.tsx` | Radio | Molecule |
| `molecules/toggle.tsx` | Toggle/Switch (`role="switch"`) | Molecule |
| `molecules/icon-box.tsx` | — (boxed icon) | Molecule |
| `molecules/icon-button.tsx` | — (btn + icon) | Molecule |
| `molecules/info-text.tsx` | — (icon callout) | Molecule |
| `molecules/pill.tsx` | Badge/Tag (link/icon variant) | Molecule |
| `molecules/text-block.tsx` | — (eyebrow/title/lead stack) | Molecule |
| `molecules/figure.tsx` | — (media + caption) | Molecule |
| `organisms/site-header.tsx` | Header/Navbar (logo + nav + theme toggle) | Organism |
| `organisms/site-footer.tsx` | Footer (copy + link nav) | Organism |
| `organisms/sidebar.tsx` | Sidebar/Navigation panel (grouped sections) | Organism |
| `organisms/page-hero.tsx`, `lead-section.tsx` | Hero section | Organism |
| `organisms/card.tsx` — Card | Content card + Product card (media/badge props) | Organism |
| `organisms/card.tsx` — CardGrid | Gallery grid | Organism |
| `organisms/data-table.tsx` | Data table | Organism |
| `organisms/form-section.tsx` | Form section (TextBlock + fields + ButtonGroup) | Organism |
| `organisms/login-form.tsx` | Registration/Login form | Organism |
| `organisms/dashboard-widget.tsx` | Dashboard widget | Organism |
| `organisms/chat-bubble.tsx` | Comment list item + Chat message bubble (`actions` slot) | Organism |
| `organisms/modal.tsx` | Modal dialog (`<dialog>`, title/actions → header/footer) | Organism |
| `organisms/drawer.tsx` | Drawer/Side panel (`<dialog>` right-anchored) | Organism |
| `organisms/notification-list.tsx` | Notification center/Inbox list | Organism |
| `organisms/filter-bar.tsx` | Filter bar (SearchField + Selects + ButtonGroup) | Organism |
| `organisms/onboarding-step.tsx` | Onboarding step (Progress + TextBlock + media + actions) | Organism |
| `organisms/pricing-card.tsx` | Pricing card | Organism |
| `organisms/timeline.tsx` | Timeline/Stepper (done/current/upcoming) | Organism |
| `organisms/badge-group.tsx` | — (labeled pill cluster) | Organism |
| `organisms/list-item.tsx` — ItemList/ListItem | — (rich list rows + action slot + meta) | Organism |
| `organisms/tooltip.tsx` | Tooltip trigger + tooltip (CSS-only) | Organism |
| `templates/showcase.tsx`, `features.tsx`, `contact.tsx`, `pricing.tsx`, `dashboard.tsx`, `docs.tsx` | — | Template |

All catalog rows are implemented — the `/components` dev route and the
demo `showcase` template (`/komponenten`) render every component with
fixture props.

### Infrastructure

- [x] `biti` added as submodule at `biti/` (`BITI_DIR ?= biti` in
      Makefile, `THEME_VARIANTS_DIR` default updated)
- [x] `biti/` excluded in `tsconfig.json`, `eslint.config.mjs`,
      `.markdownlint-cli2.jsonc` (same as other submodules)
- [x] `site.yml` logo/favicon paths repointed (`../../biti` →
      `../../arr/biti`) in `witconsult.de` + `demo`
- [x] Changelog entries (arr + biti)

## Open issues

- [ ] **`[Button:]` markers don't render as `.btn`.** `rewrite_markers`
      resolves Link and Button identically to plain `[label](target)`.
      Wiring them to `.btn`/`.btn-primary` needs either a lexical link
      feature with a class, a custom markdown syntax that survives
      conversion, or post-processing in `converters.tsx`. The `Button`
      atom exists now — the markdown→lexical path still can't reach it;
      same for `.badge` (only the `/components` showcase exercises them).
- [ ] **Active nav state.** shell.css styles `a[aria-current="page"]`
      but nothing sets it — needs the current pathname at render time
      (client NavLink or a per-path layout).
- [ ] **Old biti checkout.** `P:\git\arr\biti` still exists (was locked,
      could not be moved). Nothing references it — delete when free.
- [ ] **Variant fonts.** Dev theme variants swap token CSS only;
      `@font-face` comes from the pushed theme's `cssLight`. Fonts of
      other families fall back to system fonts unless that theme was
      pushed once.
- [ ] **Templates ↔ Payload coupling.** `pages.template` is a plain
      string; unknown values fall back silently to default. Registry in
      `components/templates/registry.tsx`.
- [ ] **`@biti/ui` backlog.** design spec + `+intent/decisions.md` D07
      amendment point at extracting shared components into a `biti-ui`
      repo/package eventually; the vendored `components/` tree is the
      interim home.
- [ ] **ThemeSwitcher vs ThemeToggle overlap in dev.** Both write
      `data-theme`; last write wins. Consider hiding the production
      toggle in dev or merging widgets.
- [ ] **Demo site coverage.** `/komponenten` (showcase template) covers
      all components; markdown pages still can't emit `.btn`/`.badge`
      until the marker issue above is solved.
