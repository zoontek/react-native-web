/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as RN from 'react-native';

import type { CompiledStyle } from '../exports/StyleSheet/compiler';

export type Except<T, K extends keyof T> = Omit<T, K>;

// A value that also accepts 'null' and 'undefined'
export type Nullable<T> = T | null | undefined;

export type ColorValue = null | string;

export type DimensionValue = null | number | string;

export type GenericStyleProp<T> =
  | null
  | undefined
  | Readonly<T>
  | false
  | CompiledStyle
  | ''
  | ReadonlyArray<GenericStyleProp<T>>;

export type LayoutValue = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LayoutEvent = {
  nativeEvent: {
    layout: LayoutValue;
    // Set from the observed 'ResizeObserverEntry.target'
    target: Element;
  };
  timeStamp: number;
};

export type PointValue = {
  x: number;
  y: number;
};

// Mixin to HTMLElement that represents additions from the `usePlatformMethods` hook
export interface PlatformMethods {
  blur: () => void;
  focus: () => void;
  measure: (callback: RN.MeasureOnSuccessCallback) => void;
  measureInWindow: (callback: RN.MeasureInWindowOnSuccessCallback) => void;
  measureLayout: (
    relativeToNativeNode: HTMLElement,
    onSuccess: RN.MeasureLayoutOnSuccessCallback,
    onFail: () => void
  ) => void;
}
