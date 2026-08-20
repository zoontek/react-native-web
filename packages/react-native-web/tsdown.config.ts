import { defineConfig, type UserConfig } from 'tsdown';

const common: UserConfig = {
  platform: 'neutral',
  entry: ['./src/**/*.{ts,tsx}', '!./src/**/__tests__'],
  target: ['chrome95', 'firefox93', 'safari15.1'],
  deps: { neverBundle: true },
  minify: process.env.MINIFY === 'true',
  unbundle: true,
  dts: false,
  sourcemap: false,
  treeshake: false
};

export default defineConfig([
  { ...common, format: 'module', outDir: './dist' },
  { ...common, format: 'commonjs', outDir: './dist/cjs' }
]);
