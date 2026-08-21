import { glob, readFile, writeFile } from 'fs/promises';

import { defineConfig, type UserConfig } from 'tsdown';

const common: UserConfig = {
  platform: 'neutral',
  logLevel: 'warn',
  entry: ['./src/**/*.{ts,tsx}', '!./src/**/__tests__'],
  target: ['chrome95', 'firefox93', 'safari15.1'],
  deps: { onlyBundle: ['react-native', '@react-native/virtualized-lists'] },
  minify: process.env.MINIFY === 'true',
  sourcemap: false,
  treeshake: false
};

export default defineConfig([
  {
    ...common,
    format: 'module',
    dts: true,
    outDir: './dist',

    async onSuccess() {
      const files = glob('./dist/**/*.d.ts');
      const regex = /^\/\/\/ <reference path="[^"]+globals\.d\.ts" \/>$/gm;

      for await (const file of files) {
        const content = await readFile(file, 'utf-8');
        await writeFile(file, content.replace(regex, ''));
      }
    }
  },
  {
    ...common,
    format: 'commonjs',
    dts: false,
    outDir: './dist/cjs'
  }
]);
