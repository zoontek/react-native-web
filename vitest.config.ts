import { defineConfig } from 'vitest/config';

const setupFiles = ['./vitest.setup.ts'];

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'dom',
          environment: 'jsdom',
          globals: true,
          include: ['packages/*/src/**/__tests__/**/*-test.ts?(x)'],
          pool: 'vmThreads',
          environmentOptions: {
            // Matches Jest's default 'testEnvironmentOptions.url'
            jsdom: { url: 'http://localhost/' }
          },
          // Only a VM context makes the JSDOM window the test global, which
          // DOM events rely on to report 'window' as their target
          setupFiles: [...setupFiles, './vitest.setup.dom.ts']
        }
      },
      {
        test: {
          name: 'node',
          environment: 'node',
          globals: true,
          include: ['packages/*/src/**/__tests__/**/*-test.node.ts?(x)'],
          setupFiles
        }
      }
    ]
  }
});
