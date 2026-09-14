import type { ComponentType } from 'react';
import type { ComponentsType } from './impl';
import type { BenchmarkTypeValue, ComponentPropsType } from './app/Benchmark';

import App from './app/App';
import impl from './impl';
import Tree from './cases/Tree';
import SierpinskiTriangle from './cases/SierpinskiTriangle';

import React from 'react';
import { createRoot } from 'react-dom/client';

export type TestSetupType = {
  Component: ComponentType<ComponentPropsType>;
  getComponentProps: (options: { cycle: number }) => ComponentPropsType;
  sampleCount: number;
  Provider: ComponentsType['Provider'];
  benchmarkType: BenchmarkTypeValue;
  version: string;
  name: string;
};

export type TestsType = Record<string, Record<string, TestSetupType>>;

type TestBlockType = Omit<TestSetupType, 'version' | 'name'>;

const implementations = impl;

const createTestBlock = (
  fn: (components: ComponentsType) => TestBlockType
): Record<string, TestSetupType> => {
  return Object.entries(implementations).reduce<Record<string, TestSetupType>>(
    (testSetups, [packageName, { name, components, version }]) => {
      const {
        Component,
        getComponentProps,
        sampleCount,
        Provider,
        benchmarkType
      } = fn(components);

      testSetups[packageName] = {
        Component,
        getComponentProps,
        sampleCount,
        Provider,
        benchmarkType,
        version,
        name
      };
      return testSetups;
    },
    {}
  );
};

const tests: TestsType = {
  'Mount deep tree': createTestBlock((components) => ({
    benchmarkType: 'mount',
    Component: Tree as unknown as ComponentType<ComponentPropsType>,
    getComponentProps: () => ({
      breadth: 2,
      components,
      depth: 7,
      id: 0,
      wrap: 1
    }),
    Provider: components.Provider,
    sampleCount: 50
  })),
  'Mount wide tree': createTestBlock((components) => ({
    benchmarkType: 'mount',
    Component: Tree as unknown as ComponentType<ComponentPropsType>,
    getComponentProps: () => ({
      breadth: 6,
      components,
      depth: 3,
      id: 0,
      wrap: 2
    }),
    Provider: components.Provider,
    sampleCount: 50
  })),
  'Update dynamic styles': createTestBlock((components) => ({
    benchmarkType: 'update',
    Component:
      SierpinskiTriangle as unknown as ComponentType<ComponentPropsType>,
    getComponentProps: ({ cycle }) => {
      return { components, s: 200, renderCount: cycle, x: 0, y: 0 };
    },
    Provider: components.Provider,
    sampleCount: 100
  }))
};

const root = document.querySelector('.root');
const element = <App tests={tests} />;

if (root != null) {
  createRoot(root).render(element);
}
