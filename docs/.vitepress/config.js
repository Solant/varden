import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'varden',
  description: 'varden documentation',
  themeConfig: {
    search: {
      provider: 'local',
    },
    sidebar: [
      {
        text: 'Guide',
        items: [
          {
            text: 'Usage',
            link: '/guide/usage',
          },
          {
            text: 'Validation',
            link: '/guide/validation',
          },
        ],
      },
    ],
  },
});
