module.exports = {
  title: 'Shyim\'s Brain',
  tagline: 'Hey my name is Shyim. In this personal Knowledgebase I will share with you some Tips and Tricks about Shopware.',
  url: 'https://shyim.me',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'shyim',
  projectName: 'shyim.me',
  themeConfig: {
    navbar: {
      title: 'Shyim\'s Brain',
      logo: {
        alt: 'Avatar',
        src: 'https://avatars3.githubusercontent.com/u/6224096?s=460&u=18be3a2d46f07dd42fc2b6dee9b4b9b68bca28d2&v=4',
      },
      items: [
        {
          to: 'docs/shopware-5/introduction',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {to: 'blog', label: 'Blog', position: 'left'},
        {to: 'docs/supporters', label: 'Supports', position: 'left'},
        {
          href: 'https://github.com/shyim',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Links',
          items: [
            {
              label: 'Twitter',
              href: 'https://twitter.com/shyim97',
            },
            {
              label: 'Github',
              href: 'https://github.com/shyim',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Shyim`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'doc1',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/shyim/shyim.me/edit/new/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/shyim/shyim.me/edit/new/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
