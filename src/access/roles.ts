import type { Access } from 'payload'

// any authenticated user (session or API key)
export const authenticated: Access = ({ req }) => Boolean(req.user)

// human editors only
export const editorOnly: Access = ({ req }) => req.user?.role === 'editor'

// editors and the content-bot (used for globals the bot pushes, e.g. theme)
export const editorOrBot: Access = ({ req }) =>
  req.user?.role === 'editor' || req.user?.role === 'content-bot'

// Public reads return published documents only: Payload does not constrain
// _status implicitly, so anonymous callers could otherwise read drafts.
export const publishedOrAuthenticated: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }
