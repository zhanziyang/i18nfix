import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'i18nfix',
  tagline: 'Write one language. Ship all languages.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://zhanziyang.github.io',

  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub Pages deployment, it is often '/<projectName>/'
  baseUrl: '/i18nfix/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'zhanziyang',
  projectName: 'i18nfix',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: 'https://github.com/zhanziyang/i18nfix/tree/main/website',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/og-v4.png',
    navbar: {
      title: 'i18nfix',
      logo: {
        alt: 'i18nfix',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/',
          label: 'Home',
          position: 'left',
          // Only active on exact homepage (GH Pages baseUrl included)
          activeBaseRegex: '^/i18nfix/?$',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          label: 'Docs',
          position: 'left',
          // Ensure only Docs is active for /docs/*
          activeBaseRegex: '^/i18nfix/docs/.*',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/zhanziyang/i18nfix',
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
            {label: 'Introduction', to: '/docs/intro'},
            {label: 'CLI Reference', href: 'https://github.com/zhanziyang/i18nfix/blob/main/docs/CLI.md'},
            {label: 'Config Reference', href: 'https://github.com/zhanziyang/i18nfix/blob/main/docs/CONFIG.md'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'GitHub', href: 'https://github.com/zhanziyang/i18nfix'},
            {label: 'Issues', href: 'https://github.com/zhanziyang/i18nfix/issues'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} i18nfix. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
