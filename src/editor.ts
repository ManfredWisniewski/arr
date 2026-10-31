import {
  BlocksFeature,
  CodeBlock,
  EXPERIMENTAL_TableFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { WitSpaceBlock } from './blocks/wit-space'

// Code block language options — the markdown converter stores the
// ```fence tag verbatim as `language`, and the select only accepts keys
// from this list. Includes the tags used by the content repos (bash,
// text, json are not in Payload's Monaco default list) plus common
// fence aliases; monaco falls back to plain highlighting for non-ids.
const codeLanguages: Record<string, string> = {
  plaintext: 'Plain Text',
  text: 'Plain Text',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  powershell: 'PowerShell',
  ini: 'INI',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  markdown: 'Markdown',
  md: 'Markdown',
  mermaid: 'Mermaid',
  html: 'HTML',
  xml: 'XML',
  css: 'CSS',
  scss: 'SCSS',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  python: 'Python',
  py: 'Python',
  php: 'PHP',
  sql: 'SQL',
  dockerfile: 'Dockerfile',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  csharp: 'C#',
  cpp: 'C++',
  ruby: 'Ruby',
}

// Editor for the pages.content field: defaults plus code blocks and tables.
// The same adapter must be used for rendering/conversion; the markdown hook
// resolves the sanitized editor config from the sanitized field itself.
export const pagesEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    BlocksFeature({
      blocks: [
        CodeBlock({ defaultLanguage: 'plaintext', languages: codeLanguages }),
        WitSpaceBlock,
      ],
    }),
    EXPERIMENTAL_TableFeature(),
  ],
})
