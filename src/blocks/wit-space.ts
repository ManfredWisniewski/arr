import type { Block } from 'payload'

// `witSpace` rich-text block for the pages editor. Markdown tag syntax:
//   <witSpace size="600" maxTilt="15" depth="90" authors="trurl@8,melkador@0:far" />
// `authors` entries are agent slugs pinned to a logo vertex
// (`slug@vert[:face]`, face ∈ near|far); slugs resolve against the
// `agents` structure doc — the card shows name/role/avatar and links to
// /blog/<slug>. jsx.import maps the parsed JSX props (strings) to block
// fields; jsx.export serializes a block node back to the tag.
export const WitSpaceBlock: Block = {
  slug: 'witSpace',
  jsx: {
    export: ({ fields }) => ({
      props: {
        ...(fields.size != null ? { size: fields.size } : {}),
        ...(fields.maxTilt != null ? { maxTilt: fields.maxTilt } : {}),
        ...(fields.depth != null ? { depth: fields.depth } : {}),
        ...(Array.isArray(fields.authors) && fields.authors.length
          ? {
              authors: (fields.authors as { agent?: string; face?: string; vert?: number }[])
                .filter((a) => a?.agent && a.vert != null)
                .map(
                  (a) =>
                    `${a.agent}@${a.vert}${a.face && a.face !== 'any' ? `:${a.face}` : ''}`,
                )
                .join(','),
            }
          : {}),
      },
    }),
    import: ({ props }) => ({
      authors:
        typeof props.authors === 'string'
          ? props.authors
              .split(',')
              .map((entry) => {
                const [head, face] = entry.trim().split(':')
                const [agent, vert] = (head ?? '').split('@')
                return {
                  agent: agent || null,
                  face: face === 'near' || face === 'far' ? face : 'any',
                  vert: vert != null && vert !== '' ? Number(vert) : null,
                }
              })
              .filter((a) => a.agent)
          : [],
      depth: props.depth != null ? Number(props.depth) : null,
      maxTilt: props.maxTilt != null ? Number(props.maxTilt) : null,
      size: props.size != null ? Number(props.size) : null,
    }),
  },
  fields: [
    {
      name: 'size',
      type: 'number',
      defaultValue: 900,
      admin: {
        description: 'Logo width in px (aspect ratio fixed at 15:7)',
      },
    },
    {
      name: 'maxTilt',
      type: 'number',
      defaultValue: 30,
      admin: {
        description: 'Max tilt per axis in degrees (pointer at viewport edge)',
      },
    },
    {
      name: 'depth',
      type: 'number',
      admin: {
        description: 'Extrusion depth in px — leave empty for size × 0.15',
      },
    },
    {
      name: 'authors',
      type: 'array',
      admin: {
        description:
          'Author cards revealed on vertex hover — resolved from the agents structure doc (name, role, avatar, /blog/<slug> link)',
      },
      fields: [
        {
          name: 'agent',
          type: 'text',
          required: true,
          admin: { description: 'Agent slug, e.g. trurl' },
        },
        {
          name: 'vert',
          type: 'number',
          required: true,
          admin: {
            description:
              'Flat vertex index — t: 0–7, V: 8–16, bar: 17–22 (19 unavailable)',
          },
        },
        {
          name: 'face',
          type: 'select',
          defaultValue: 'any',
          options: [
            { label: 'Either face', value: 'any' },
            { label: 'Near face', value: 'near' },
            { label: 'Far face', value: 'far' },
          ],
        },
      ],
    },
  ],
}
