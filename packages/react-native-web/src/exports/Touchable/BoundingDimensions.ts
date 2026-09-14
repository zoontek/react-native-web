/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Nullable } from '../../types';

import PooledClass from '../../vendor/react-native/PooledClass';

const twoArgumentPooler = PooledClass.twoArgumentPooler;

export type BoundingDimensionsInstance = {
  width: number;
  height: number;
  destructor: () => void;
};

type BoundingDimensionsStatic = {
  (this: BoundingDimensionsInstance, width: number, height: number): void;
  prototype: BoundingDimensionsInstance;
  getPooled: (width: number, height: number) => BoundingDimensionsInstance;
  getPooledFromElement: (element: HTMLElement) => BoundingDimensionsInstance;
  release: (instance: BoundingDimensionsInstance) => void;
};

/**
 * PooledClass representing the bounding rectangle of a region.
 */
const BoundingDimensions = function (
  this: BoundingDimensionsInstance,
  width: number,
  height: number
) {
  this.width = width;
  this.height = height;
} as BoundingDimensionsStatic;

BoundingDimensions.prototype.destructor = function (this: {
  width: Nullable<number>;
  height: Nullable<number>;
}) {
  this.width = null;
  this.height = null;
};

BoundingDimensions.getPooledFromElement = function (element: HTMLElement) {
  return BoundingDimensions.getPooled(
    element.offsetWidth,
    element.offsetHeight
  );
};

PooledClass.addPoolingTo(BoundingDimensions, twoArgumentPooler);

export default BoundingDimensions;
