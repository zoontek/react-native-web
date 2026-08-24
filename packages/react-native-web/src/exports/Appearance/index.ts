/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import type * as RN from 'react-native';

import canUseDOM from '../../modules/canUseDom';

const query =
  canUseDOM && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

const listenerMapping = new WeakMap<
  (preferences: RN.Appearance.AppearancePreferences) => void,
  (event: MediaQueryListEvent) => void
>();

const Appearance: typeof RN.Appearance = {
  getColorScheme() {
    return query != null && query.matches ? 'dark' : 'light';
  },

  setColorScheme() {},

  addChangeListener(listener) {
    let mappedListener = listenerMapping.get(listener);

    if (mappedListener == null) {
      mappedListener = ({ matches }) => {
        listener({ colorScheme: matches ? 'dark' : 'light' });
      };

      listenerMapping.set(listener, mappedListener);
    }

    if (query != null) {
      query.addEventListener('change', mappedListener);
    }

    return {
      remove() {
        const mappedListener = listenerMapping.get(listener);

        if (mappedListener != null) {
          query?.removeEventListener('change', mappedListener);
        }

        listenerMapping.delete(listener);
      }
    };
  }
};

export default Appearance;
