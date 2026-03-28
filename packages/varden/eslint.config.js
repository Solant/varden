import airbnb from 'eslint-stylistic-airbnb';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  {
    ignores: [
      'bundle-report',
      'coverage',
      'dist',
    ],
  },

  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  airbnb.configs['flat/recommended'],
  airbnb.configs['flat/addon-iterators'],
  airbnb.configs['flat/addon-typescript'],
  airbnb.configs['flat/addon-vue'],
  airbnb.configs['flat/addon-vue-ts'],

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
