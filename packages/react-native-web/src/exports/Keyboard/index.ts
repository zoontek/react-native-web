/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as RN from 'react-native';

import dismissKeyboard from '../../modules/dismissKeyboard';

function noop() {}

// in the future we can use https://github.com/w3c/virtual-keyboard
const Keyboard: typeof RN.Keyboard = {
  isVisible: () => false,
  addListener: () => ({ remove() {} }),
  dismiss: dismissKeyboard,
  removeAllListeners: noop,
  metrics: () => null,
  scheduleLayoutAnimation: noop
};

export default Keyboard;
