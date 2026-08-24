/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use client';

import { useEffect, useState } from 'react';
import type * as RN from 'react-native';

import Dimensions, { type DimensionsValue } from '../Dimensions';

const useWindowDimensions: typeof RN.useWindowDimensions = () => {
  const [dims, setDims] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const { remove } = Dimensions.addEventListener(
      'change',
      ({ window }: DimensionsValue) => {
        if (window != null) {
          setDims(window);
        }
      }
    );

    // We might have missed an update between calling `get` in render and
    // `addEventListener` in this handler, so we set it here. If there was
    // no change, React will filter out this update as a no-op.
    setDims(Dimensions.get('window'));
    return remove;
  }, []);
  return dims;
};

export default useWindowDimensions;
