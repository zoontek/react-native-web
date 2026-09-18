/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import { useEffect, useState } from 'react';
import type * as RN from 'react-native';

import Appearance from '../Appearance';

const useColorScheme: typeof RN.useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme);

  useEffect(() => {
    const { remove } = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return remove;
  });

  return colorScheme;
};

export default useColorScheme;
