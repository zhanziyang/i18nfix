import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'i18nfix',
  tagline: 'Check, fix, translate i18n locale files — safely.',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  // If you deploy to GitHub Pages under https://zhanziyang.github.io/i18nfix/
  // these defaults will be correct.
  url: 'https://zhanziyang.github.io',
  baseUrl: '/i18nfix/',

  // GitHub pages deployment config.
  organizationName: 'zhanziyang',
  projectName: 'i18nfix',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
          editUrl: 'https://github.com/zhanziyang/i18nfix/tree/main/website/',
          lastVersion: 'current',
          versions: {
            current: {
              label: 'Next',
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'i18nfix',
      logo: {
        alt: 'i18nfix',
        src: 'img/logo.svg',
      },
      items: [
        {to: '/', label: 'Home', position: 'left'},
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/demo', label: 'Demo', position: 'left'},
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
