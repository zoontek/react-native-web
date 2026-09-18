/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as RN from 'react-native';

const vibrate = (pattern: VibratePattern) => {
  if ('vibrate' in window.navigator) {
    window.navigator.vibrate(pattern);
  }
};

const Vibration: typeof RN.Vibration = {
  vibrate(pattern = 400) {
    vibrate(pattern);
  },
  cancel() {
    vibrate(0);
  }
};

export default Vibration;
