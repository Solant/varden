import { defineConfig } from 'tsdown';
import Vue from 'unplugin-vue/rolldown';

import { statsPlugin } from 'vite-bundle-explorer/plugin';

export default defineConfig({
  plugins: [Vue({ isProduction: true }), statsPlugin()],
  entry: {
    index: './src/index.ts',
  },
  platform: 'neutral',
  format: ['esm', 'cjs'],
  tsconfig: './tsconfig.app.json',
  dts: { vue: true },
  hash: false,
  outputOptions: {
    minifyInternalExports: false,
  },
});
