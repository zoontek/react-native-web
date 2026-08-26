/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as RN from 'react-native';

import Dimensions from '../Dimensions';

const get = () => Dimensions.get('window').scale;

const PixelRatio: typeof RN.PixelRatio = class {
  static get() {
    return get();
  }

  static getFontScale() {
    return Dimensions.get('window').fontScale || get();
  }

  static getPixelSizeForLayoutSize(layoutSize: number): number {
    return Math.round(layoutSize * get());
  }

  static roundToNearestPixel(layoutSize: number): number {
    const ratio = get();
    return Math.round(layoutSize * ratio) / ratio;
  }

  static startDetecting() {}
};

export default PixelRatio;
