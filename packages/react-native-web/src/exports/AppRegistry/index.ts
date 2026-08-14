/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import type {
  AppProps,
  Application,
  ApplicationElement,
  WrapperComponentType
} from './renderApplication';
import type { ComponentType } from 'react';
import type { Root } from 'react-dom/client';
import type { Nullable } from '../../types';

import invariant from 'fbjs/lib/invariant';
import unmountComponentAtNode from '../unmountComponentAtNode';
import renderApplication, { getApplication } from './renderApplication';

type AppParams = {
  callback?: () => void;
  hydrate?: boolean;
  initialProps?: AppProps;
  mode?: string;
  rootTag: HTMLElement;
};
type Runnable = {
  getApplication?: (appParams?: Partial<AppParams>) => ApplicationElement;
  run: (appParams: AppParams) => Application;
};

export type ComponentProvider = () => ComponentType<AppProps>;
export type ComponentProviderInstrumentationHook = (
  component: ComponentProvider
) => ComponentType<AppProps>;
export type WrapperComponentProvider = (
  appParams?: Partial<AppParams>
) => WrapperComponentType;

export type AppConfig = {
  appKey: string;
  component?: ComponentProvider;
  run?: (appParams: AppParams) => Application;
  section?: boolean;
};

const emptyObject = {};
const runnables: { [appKey: string]: Runnable } = {};

let componentProviderInstrumentationHook: ComponentProviderInstrumentationHook =
  (component: ComponentProvider) => component();
let wrapperComponentProvider: Nullable<WrapperComponentProvider>;

/**
 * `AppRegistry` is the JS entry point to running all React Native apps.
 */
export default class AppRegistry {
  static getAppKeys(): Array<string> {
    return Object.keys(runnables);
  }

  static getApplication(
    appKey: string,
    appParameters?: Partial<AppParams>
  ): ApplicationElement {
    invariant(
      runnables[appKey] && runnables[appKey].getApplication,
      `Application ${appKey} has not been registered. ` +
        'This is either due to an import error during initialization or failure to call AppRegistry.registerComponent.'
    );

    return (runnables[appKey] as Required<Runnable>).getApplication(
      appParameters
    );
  }

  static registerComponent(
    appKey: string,
    componentProvider: ComponentProvider
  ): string {
    runnables[appKey] = {
      getApplication: (appParameters) =>
        getApplication(
          componentProviderInstrumentationHook(componentProvider),
          appParameters ? appParameters.initialProps : emptyObject,
          wrapperComponentProvider && wrapperComponentProvider(appParameters)
        ),
      run: (appParameters) =>
        renderApplication(
          componentProviderInstrumentationHook(componentProvider),
          wrapperComponentProvider && wrapperComponentProvider(appParameters),
          appParameters.callback,
          {
            hydrate: appParameters.hydrate || false,
            initialProps: appParameters.initialProps || emptyObject,
            mode: appParameters.mode || 'concurrent',
            rootTag: appParameters.rootTag
          }
        )
    };
    return appKey;
  }

  static registerConfig(config: Array<AppConfig>) {
    config.forEach(({ appKey, component, run }) => {
      if (run) {
        AppRegistry.registerRunnable(appKey, run);
      } else {
        invariant(component, 'No component provider passed in');
        AppRegistry.registerComponent(appKey, component as ComponentProvider);
      }
    });
  }

  // TODO: fix style sheet creation when using this method
  static registerRunnable(
    appKey: string,
    run: (appParams: AppParams) => Application
  ): string {
    runnables[appKey] = { run };
    return appKey;
  }

  static runApplication(appKey: string, appParameters: AppParams): Application {
    const isDevelopment =
      process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
    if (isDevelopment) {
      const params: Record<string, unknown> = { ...appParameters };
      params.rootTag = `#${appParameters.rootTag.id}`;

      console.log(
        `Running application "${appKey}" with appParams:\n`,
        params,
        `\nDevelopment-level warnings: ${isDevelopment ? 'ON' : 'OFF'}.` +
          `\nPerformance optimizations: ${isDevelopment ? 'OFF' : 'ON'}.`
      );
    }

    invariant(
      runnables[appKey] && runnables[appKey].run,
      `Application "${appKey}" has not been registered. ` +
        'This is either due to an import error during initialization or failure to call AppRegistry.registerComponent.'
    );

    return (runnables[appKey] as Runnable).run(appParameters);
  }

  static setComponentProviderInstrumentationHook(
    hook: ComponentProviderInstrumentationHook
  ) {
    componentProviderInstrumentationHook = hook;
  }

  static setWrapperComponentProvider(provider: WrapperComponentProvider) {
    wrapperComponentProvider = provider;
  }

  static unmountApplicationComponentAtRootTag(rootTag: Root) {
    unmountComponentAtNode(rootTag);
  }
}
