/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import type VirtualizedList from '../VirtualizedList';
import type { Nullable } from '../../../types';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

const __DEV__ = process.env.NODE_ENV !== 'production';

type ContextValue = Readonly<{
  cellKey: Nullable<string>;
  getScrollMetrics: () => {
    contentLength: number;
    dOffset: number;
    dt: number;
    offset: number;
    timestamp: number;
    velocity: number;
    visibleLength: number;
    zoomScale: number;
  };
  horizontal: Nullable<boolean>;
  getOutermostParentListRef: () => VirtualizedList;
  registerAsNestedChild: (params: {
    cellKey: string;
    ref: VirtualizedList;
  }) => void;
  unregisterAsNestedChild: (params: { ref: VirtualizedList }) => void;
}>;

export const VirtualizedListContext =
  createContext<Nullable<ContextValue>>(null);

if (__DEV__) {
  VirtualizedListContext.displayName = 'VirtualizedListContext';
}

/**
 * Resets the context. Intended for use by portal-like components (e.g. Modal).
 */
export function VirtualizedListContextResetter({
  children
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <VirtualizedListContext.Provider value={null}>
      {children}
    </VirtualizedListContext.Provider>
  );
}

/**
 * Sets the context with memoization. Intended to be used by `VirtualizedList`.
 */
export function VirtualizedListContextProvider({
  children,
  value
}: {
  children: ReactNode;
  value: ContextValue;
}): ReactNode {
  // Avoid setting a newly created context object if the values are identical.
  const context = useMemo(
    () => ({
      cellKey: null,
      getScrollMetrics: value.getScrollMetrics,
      horizontal: value.horizontal,
      getOutermostParentListRef: value.getOutermostParentListRef,
      registerAsNestedChild: value.registerAsNestedChild,
      unregisterAsNestedChild: value.unregisterAsNestedChild
    }),
    [
      value.getScrollMetrics,
      value.horizontal,
      value.getOutermostParentListRef,
      value.registerAsNestedChild,
      value.unregisterAsNestedChild
    ]
  );
  return (
    <VirtualizedListContext.Provider value={context}>
      {children}
    </VirtualizedListContext.Provider>
  );
}

/**
 * Sets the `cellKey`. Intended to be used by `VirtualizedList` for each cell.
 */
export function VirtualizedListCellContextProvider({
  cellKey,
  children
}: {
  cellKey: string;
  children: ReactNode;
}): ReactNode {
  // Avoid setting a newly created context object if the values are identical.
  const currContext = useContext(VirtualizedListContext);
  const context = useMemo(
    () => (currContext == null ? null : { ...currContext, cellKey }),
    [currContext, cellKey]
  );
  return (
    <VirtualizedListContext.Provider value={context}>
      {children}
    </VirtualizedListContext.Provider>
  );
}
