import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'arr docs',
  tagline: 'Documentation for the arr Payload CMS application',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // The site is served from inside the arr image at /docs on every instance.
  url: 'https://witconsult.de',
  baseUrl: '/docs/',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  trailingSlash: true,

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: 'dev',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/ManfredWisniewski/arr/edit/main/docs/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/ManfredWisniewski/arr/edit/main/docs/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'editor',
        path: 'docs-editor',
        routeBasePath: 'editor',
        sidebarPath: './sidebarsEditor.ts',
        editUrl: 'https://github.com/ManfredWisniewski/arr/edit/main/docs/',
      },
    ],
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en', 'de'],
        docsRouteBasePath: ['/dev', '/editor'],
        indexDocs: true,
        indexBlog: true,
        indexPages: false,
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'arr docs',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'devSidebar',
          position: 'left',
          label: 'Developer',
        },
        {
          type: 'docSidebar',
          sidebarId: 'editorSidebar',
          docsPluginId: 'editor',
          position: 'left',
          label: 'Editor',
        },
        {to: '/blog', label: 'Release-Blog', position: 'left'},
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/ManfredWisniewski/arr',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Developer', to: '/dev/intro'},
            {label: 'Editor', to: '/editor/'},
            {label: 'Release-Blog', to: '/blog'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} witconsult. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
