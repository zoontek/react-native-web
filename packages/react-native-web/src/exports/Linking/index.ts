/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as RN from 'react-native';

import canUseDOM from '../../modules/canUseDom';
import type { Except } from '../../types';

type LinkingTarget = '_blank' | '_self' | '_parent' | '_top';

// Wrap each listener in an object so the same function can be registered twice
const listeners: Record<string, Set<{ listener: Function }>> = {};
const initialURL = canUseDOM ? window.location.href : '';

const emit: (typeof RN.Linking)['emit'] = (type, ...args) => {
  listeners[type]?.forEach(({ listener }) => listener(...args));
};

const open = (url: string, target?: LinkingTarget) => {
  if (canUseDOM) {
    const urlToOpen = new URL(url, window.location.href).toString();

    if (urlToOpen.indexOf('tel:') === 0) {
      window.location.href = urlToOpen;
    } else {
      window.open(urlToOpen, target, 'noopener');
    }
  }
};

const addListener: (typeof RN.Linking)['addListener'] = (type, listener) => {
  const entry = { listener };

  listeners[type] ??= new Set();
  listeners[type].add(entry);

  return {
    remove() {
      listeners[type]?.delete(entry);
    }
  };
};

const Linking: Except<typeof RN.Linking, 'openURL'> & {
  /**
   * Open the given URL with any installed app that can handle it. This
   * includes URLs such as locations (e.g. "geo:37.484847,-122.148386"),
   * contacts, or any other URL that can be opened with installed apps.
   *
   * This method will fail if the system doesn't know how to open the
   * specified URL. If you're passing in a non-http(s) URL, it's best to
   * check `canOpenURL` first. For web URLs, the protocol ("http://",
   * "https://") must be set accordingly.
   */
  openURL: (url: string, target?: LinkingTarget) => Promise<void>;
} = {
  addListener,
  addEventListener: addListener,
  emit,

  listenerCount: (type) => listeners[type]?.size ?? 0,
  canOpenURL: () => Promise.resolve(true),
  getInitialURL: () => Promise.resolve(initialURL),
  sendIntent: () => Promise.resolve(),
  openSettings: () => Promise.resolve(),

  removeAllListeners: (type) => {
    if (type != null) {
      listeners[type]?.clear();
    }
  },

  openURL: (url, target) => {
    try {
      open(url, target);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
};

export default Linking;
