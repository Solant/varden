import { beforeAll, afterAll } from 'vitest';

const { warn } = console;
beforeAll(() => {
  // eslint-disable-next-line no-console
  console.warn = () => {};
});
afterAll(() => {
  // eslint-disable-next-line no-console
  console.warn = warn;
});
