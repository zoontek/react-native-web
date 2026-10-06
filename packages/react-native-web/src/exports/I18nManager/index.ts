/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as RN from 'react-native';

const noop = () => {};

const I18nManager: RN.I18nManager = {
  getConstants: () => ({
    doLeftAndRightSwapInRTL: false,
    isRTL: false
  }),

  allowRTL: noop,
  forceRTL: noop,
  swapLeftAndRightInRTL: noop,

  isRTL: false,
  doLeftAndRightSwapInRTL: false
};

export default I18nManager;
