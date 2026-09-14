/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import mergeRefs from '../mergeRefs';
import type { Nullable } from '../../types';
import { useMemo, type Ref } from 'react';

export default function useMergeRefs<T = HTMLElement>(
  ...args: ReadonlyArray<Nullable<Ref<T>>>
): (node: T | null) => void {
  return useMemo(
    () => mergeRefs(...args),
    [...args] // oxlint-disable-line react/exhaustive-deps
  );
}
