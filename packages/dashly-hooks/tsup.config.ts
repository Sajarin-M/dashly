import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  external: [
    'react ',
    'react-dom ',
    '@emotion/react ',
    '@mantine/core ',
    '@mantine/hooks ',
    '@mantine/utils',
  ],
});
