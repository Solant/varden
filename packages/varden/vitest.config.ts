import { defineConfig, type Plugin } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          // an example of file based convention,
          // you don't have to follow it
          include: ['src/*.spec.ts', 'tests/*.spec.ts'],
          name: 'unit',
          environment: 'node',
        },
      },
      process.env.CI === 'true' ? null : {
        plugins: [vue() as Plugin],
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
    ].filter((item): item is NonNullable<typeof item> => item !== null),
  },
});
