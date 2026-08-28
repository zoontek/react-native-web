/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import invariant from 'fbjs/lib/invariant';
import type { ComponentType } from 'react';
import type { Root } from 'react-dom/client';
import type * as RN from 'react-native';

import type { Except } from '../../types';
import {
  getApplication,
  renderApplication,
  type AppProps,
  type Application,
  type ApplicationElement,
  type WrapperComponentType
} from './renderApplication';

type AppParameters = {
  callback?: () => void;
  hydrate?: boolean;
  initialProps?: AppProps;
  mode?: string;
  rootTag: HTMLElement;
};

type Runnable = (appParameters: AppParameters) => Application;
type Runnables = Record<string, Runnable>;

type Registry = {
  runnables: Runnables;
  sections: ReadonlyArray<string>;
};

type RegisteredApp = {
  run: Runnable;
  getApplication?: (
    appParameters?: Partial<AppParameters>
  ) => ApplicationElement;
};

type ComponentProvider = () => ComponentType<AppProps>;

type ComponentProviderInstrumentationHook = (
  component: ComponentProvider
) => ComponentType<AppProps>;

type WrapperComponentProvider = (
  appParameters?: Partial<AppParameters>
) => WrapperComponentType;

type AppConfig = {
  appKey: string;
  component?: ComponentProvider;
  run?: Runnable;
  section?: boolean;
};

const registeredApps: Record<string, RegisteredApp> = {};
const sections: Record<string, RegisteredApp> = {};

const toRunnables = (apps: Record<string, RegisteredApp>): Runnables =>
  Object.fromEntries(
    Object.entries(apps).map(([appKey, app]) => [appKey, app.run])
  );

let componentProviderInstrumentationHook: ComponentProviderInstrumentationHook =
  (component: ComponentProvider): ComponentType => component();

let wrapperComponentProvider: WrapperComponentProvider | undefined;

const noop = () => {};

const registerComponent: typeof RN.AppRegistry.registerComponent = (
  appKey,
  componentProvider,
  section
) => {
  registeredApps[appKey] = {
    getApplication: (appParameters = {}) =>
      getApplication(
        componentProviderInstrumentationHook(componentProvider),
        appParameters,
        wrapperComponentProvider?.(appParameters)
      ),

    run: (appParameters) =>
      renderApplication(
        componentProviderInstrumentationHook(componentProvider),
        wrapperComponentProvider?.(appParameters),
        appParameters.callback,
        {
          hydrate: appParameters.hydrate ?? false,
          initialProps: appParameters.initialProps ?? {},
          mode: appParameters.mode ?? 'concurrent',
          rootTag: appParameters.rootTag
        }
      )
  };

  if (section) {
    sections[appKey] = registeredApps[appKey];
  }

  return appKey;
};

// TODO: fix style sheet creation when using this method
const registerRunnable = (appKey: string, run: Runnable): string => {
  registeredApps[appKey] = { run };
  return appKey;
};

const AppRegistry: Except<
  typeof RN.AppRegistry,
  | 'getRegistry'
  | 'getRunnable'
  | 'getSections'
  | 'registerConfig'
  | 'registerRunnable'
  | 'runApplication'
  | 'setComponentProviderInstrumentationHook'
  | 'setWrapperComponentProvider'
  | 'unmountApplicationComponentAtRootTag'
> & {
  /**
   * A web-only method for server-side rendering to HTML and CSS. Returns the
   * registered app's `element` and a `getStyleElement` function that provides
   * the styles once the element is rendered.
   */
  getApplication(
    appKey: string,
    appParameters?: Partial<AppParameters>
  ): ApplicationElement;

  /**
   * Returns the full registry of section keys and runnables.
   */
  getRegistry(): Registry;

  /**
   * Returns the runnable registered for the given app key.
   */
  getRunnable(appKey: string): Runnable | null | undefined;

  /**
   * Returns a copy of the registered sections map.
   */
  getSections(): Runnables;

  /**
   * Registers multiple apps with a single call by providing an array of app
   * configurations.
   */
  registerConfig(config: Array<AppConfig>): void;

  /**
   * Registers a custom run function for the given app key.
   */
  registerRunnable(appKey: string, run: Runnable): string;

  /**
   * Loads the JavaScript bundle and runs the app registered under the given
   * key. This is called by the native system when it is ready to display the
   * app.
   *
   * See https://reactnative.dev/docs/appregistry#runapplication
   */
  runApplication(appKey: string, appParameters: AppParameters): Application;

  /**
   * Sets a hook that is called when a component provider is instrumented
   * during registration.
   */
  setComponentProviderInstrumentationHook(
    hook: ComponentProviderInstrumentationHook
  ): void;

  /**
   * Sets a provider for a wrapper component that will wrap the root component
   * of every registered app.
   */
  setWrapperComponentProvider(provider: WrapperComponentProvider): void;

  /**
   * Stops an application when a view should be destroyed. Should always be
   * called as a counterpart to `runApplication`.
   *
   * See https://reactnative.dev/docs/appregistry#unmountapplicationcomponentatroottag
   */
  unmountApplicationComponentAtRootTag(rootTag: Root): void;
} = {
  registerComponent,
  registerRunnable,

  registerConfig(config) {
    config.forEach(({ appKey, component, run, section }) => {
      if (run != null) {
        registerRunnable(appKey, run);
      } else {
        invariant(component, 'No component provider passed in');
        registerComponent(appKey, component, section);
      }
    });
  },

  registerSection(appKey, component) {
    registerComponent(appKey, component, true);
  },

  getAppKeys: () => Object.keys(registeredApps),
  getSectionKeys: () => Object.keys(sections),
  getSections: () => toRunnables(sections),
  getRunnable: (appKey) => registeredApps[appKey]?.run,

  getRegistry: () => ({
    runnables: toRunnables(registeredApps),
    sections: Object.keys(sections)
  }),

  setComponentProviderInstrumentationHook(hook) {
    componentProviderInstrumentationHook = hook;
  },

  setWrapperComponentProvider(provider) {
    wrapperComponentProvider = provider;
  },

  getApplication(appKey, appParameters) {
    const app = registeredApps[appKey];

    invariant(
      app != null && app.getApplication != null,
      `Application ${appKey} has not been registered. ` +
        'This is either due to an import error during initialization or failure to call AppRegistry.registerComponent.'
    );

    return app.getApplication(appParameters);
  },

  runApplication(appKey, appParameters) {
    const isDevelopment =
      process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

    if (isDevelopment) {
      const params: Record<string, unknown> = { ...appParameters };
      params.rootTag = `#${appParameters.rootTag.id}`;

      console.log(
        `Running application "${appKey}" with appParameters:\n`,
        params,
        `\nDevelopment-level warnings: ${isDevelopment ? 'ON' : 'OFF'}.` +
          `\nPerformance optimizations: ${isDevelopment ? 'OFF' : 'ON'}.`
      );
    }

    invariant(
      registeredApps[appKey] && registeredApps[appKey].run,
      `Application "${appKey}" has not been registered. ` +
        'This is either due to an import error during initialization or failure to call AppRegistry.registerComponent.'
    );

    return registeredApps[appKey].run(appParameters);
  },

  unmountApplicationComponentAtRootTag(rootTag) {
    rootTag.unmount();
  },

  // mocks
  setRootViewStyleProvider: noop,
  setSurfaceProps: noop,
  registerHeadlessTask: noop,
  registerCancellableHeadlessTask: noop,
  startHeadlessTask: noop,
  cancelHeadlessTask: noop
};

export default AppRegistry;
