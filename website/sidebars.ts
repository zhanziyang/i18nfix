import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
    },
    {
      type: 'doc',
      id: 'getting-started',
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/workflow',
        'guides/ci',
        'guides/translation-providers',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/config',
        {
          type: 'category',
          label: 'CLI',
          items: [
            'reference/cli',
            'reference/commands/init',
            'reference/commands/config',
            'reference/commands/check',
            'reference/commands/fix',
            'reference/commands/translate',
            'reference/commands/new',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
