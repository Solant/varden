import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          // an example of file based convention,
          // you don't have to follow it
          include: ['src/*.spec.ts'],
          name: 'unit',
          environment: 'node',
        },
      },
      {
        plugins: [vue()],
        test: {
          include: ['src/components/*.spec.ts'],
          name: 'browser',
          environment: 'node',
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
