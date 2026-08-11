// @ts-nocheck

/*:: import { type Component } from 'react'; */
import packageJson from '../package.json';

const { dependencies } = packageJson;

/*:: type ComponentsType = {
  Box: Component,
  Dot: Component,
  Provider: Component,
  View: Component
}; */

/*:: type ImplementationType = {
  components: ComponentsType,
  name: string,
  version: string
}; */

const toImplementations = (
  modules /*: Object */
) /*: Array<ImplementationType> */ =>
  Object.keys(modules).map((path) => {
    const components = modules[path].default;
    const name = path.split('/')[2];
    const version = dependencies[name] || '';
    return { components, name, version };
  });

const toObject = (impls /*: Array<ImplementationType> */) /*: Object */ =>
  impls.reduce((acc, impl) => {
    acc[impl.name] = impl;
    return acc;
  }, {});

const map = toObject(
  toImplementations(
    import.meta.glob('./implementations/*/index.ts', { eager: true })
  )
);

export default map;
