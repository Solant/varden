import { beforeAll, afterAll } from 'vitest';
const warn = console.warn;
beforeAll(() => {
  console.warn = () => {};
});
afterAll(() => {
  console.warn = warn;
});
