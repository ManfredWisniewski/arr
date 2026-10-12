import type { Block } from 'payload'

// `witSpace` rich-text block for the pages editor. Markdown tag syntax:
//   <witSpace size="600" maxTilt="15" depth="90" />
// jsx.import maps the parsed JSX props (strings) to block fields;
// jsx.export serializes a block node back to the tag.
export const WitSpaceBlock: Block = {
  slug: 'witSpace',
  jsx: {
    export: ({ fields }) => ({
      props: {
        ...(fields.size != null ? { size: fields.size } : {}),
        ...(fields.maxTilt != null ? { maxTilt: fields.maxTilt } : {}),
        ...(fields.depth != null ? { depth: fields.depth } : {}),
      },
    }),
    import: ({ props }) => ({
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
  ],
}
