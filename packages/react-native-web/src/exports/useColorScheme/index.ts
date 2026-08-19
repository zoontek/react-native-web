/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import { useEffect, useState } from 'react';

import type { AppearancePreferences, ColorSchemeName } from '../Appearance';
import Appearance from '../Appearance';

export default function useColorScheme(): ColorSchemeName {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    function listener(appearance: AppearancePreferences) {
      setColorScheme(appearance.colorScheme);
    }
    const { remove } = Appearance.addChangeListener(listener);
    return remove;
  });

  return colorScheme;
}
