import type { Access } from 'payload'

// any authenticated user (session or API key)
export const authenticated: Access = ({ req }) => Boolean(req.user)

// human editors only
export const editorOnly: Access = ({ req }) => req.user?.role === 'editor'

// editors and the content-bot (used for globals the bot pushes, e.g. theme)
export const editorOrBot: Access = ({ req }) =>
  req.user?.role === 'editor' || req.user?.role === 'content-bot'
