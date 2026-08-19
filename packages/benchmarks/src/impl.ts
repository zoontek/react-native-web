import type { ComponentType, ReactNode } from 'react';

import packageJson from '../package.json';

const dependencies: Record<string, string | undefined> =
  packageJson.dependencies;

export type BoxProps = {
  children?: ReactNode;
  color?: number;
  fixed?: boolean;
  layout?: 'column' | 'row';
  outer?: boolean;
};

export type DotProps = {
  children?: ReactNode;
  color: string;
  size: number;
  x: number;
  y: number;
};

export type ComponentsType = {
  Box: ComponentType<BoxProps>;
  Dot?: ComponentType<DotProps>;
  Provider: ComponentType<{ children?: ReactNode }>;
};

type ImplementationType = {
  components: ComponentsType;
  name: string;
  version: string;
};

const toImplementations = (
  modules: Record<string, { default: ComponentsType }>
): Array<ImplementationType> =>
  Object.entries(modules).map(([path, module]) => {
    const components = module.default;
    const name = path.split('/')[2] ?? '';
    const version = dependencies[name] || '';
    return { components, name, version };
  });

const toObject = (
  impls: Array<ImplementationType>
): Record<string, ImplementationType> =>
  impls.reduce<Record<string, ImplementationType>>((acc, impl) => {
    acc[impl.name] = impl;
    return acc;
  }, {});

const map = toObject(
  toImplementations(
    import.meta.glob<{ default: ComponentsType }>(
      './implementations/*/index.ts',
      { eager: true }
    )
  )
);

export default map;
