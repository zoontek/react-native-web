/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A value that also accepts 'null' and 'undefined'
export type Nullable<T> = T | null | undefined;

export type ColorValue = null | string;

export type DimensionValue = null | number | string;

export type EdgeInsetsValue = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

export type GenericStyleProp<T> =
  | null
  | undefined
  | Readonly<T>
  | false
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

export type LayoutCallback = (
  x: number,
  y: number,
  width: number,
  height: number,
  left: number,
  top: number
) => void;

export type MeasureInWindowCallback = (
  left: number,
  top: number,
  width: number,
  height: number
) => void;

// Mixin to HTMLElement that represents additions from the `usePlatformMethods` hook
export interface PlatformMethods {
  blur: () => void;
  focus: () => void;
  measure: (callback: LayoutCallback) => void;
  measureInWindow: (callback: MeasureInWindowCallback) => void;
  measureLayout: (
    relativeToNativeNode: object,
    onSuccess: LayoutCallback,
    onFail: () => void
  ) => void;
}
