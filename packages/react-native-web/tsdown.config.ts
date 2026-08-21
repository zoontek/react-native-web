import { defineConfig, type UserConfig } from 'tsdown';

const common: UserConfig = {
  platform: 'neutral',
  logLevel: 'warn',
  entry: ['./src/**/*.{ts,tsx}', '!./src/**/__tests__'],
  target: ['chrome95', 'firefox93', 'safari15.1'],
  deps: { onlyBundle: ['react-native', '@react-native/virtualized-lists'] },
  minify: process.env.MINIFY === 'true',
  dts: false,
  sourcemap: false,
  treeshake: false
};

export default defineConfig([
  { ...common, format: 'module', outDir: './dist', dts: true },
  { ...common, format: 'commonjs', outDir: './dist/cjs' }
]);
