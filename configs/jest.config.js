'use strict';

const configFile = require.resolve('./babel.config.js');

module.exports = {
  fakeTimers: {
    enableGlobally: true
  },
  modulePathIgnorePatterns: [
    '<rootDir>/packages/benchmarks/',
    '<rootDir>/packages/react-native-web-docs/',
    '<rootDir>/packages/react-native-web-examples/',
    '<rootDir>/packages/react-native-web/dist/'
  ],
  rootDir: process.cwd(),
  roots: ['<rootDir>/packages'],
  setupFiles: [require.resolve('./jest-setupFiles.dom.js')],
  snapshotFormat: {
    printBasicPrototype: false
  },
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/?(*-)+(spec|test).[jt]s?(x)'],
  transform: {
    '\\.[jt]sx?$': ['babel-jest', { configFile }]
  }
};
