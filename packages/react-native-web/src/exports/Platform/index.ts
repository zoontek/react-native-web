/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as RN from 'react-native';

const Platform: typeof RN.Platform = {
  OS: 'web',

  get constants() {
    return {
      reactNativeVersion: {
        major: 0,
        minor: 0,
        patch: 0,
        prerelease: undefined
      }
    };
  },
  get isDisableAnimations() {
    return false;
  },
  get isTV() {
    return false;
  },
  get isTesting() {
    return process.env.NODE_ENV === 'test';
  },
  get Version() {
    return '0.0.0';
  },

  select: <T>(spec: RN.PlatformSelectSpec<T>) =>
    // TODO: Fix the incorrect typing upstream
    'web' in spec ? (spec as { web: T }).web : (spec as { default: T }).default
};

export default Platform;
