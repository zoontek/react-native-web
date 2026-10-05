/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Nullable } from '../../types';
import PooledClass from '../../vendor/react-native/PooledClass';

const twoArgumentPooler = PooledClass.twoArgumentPooler;

export type PositionInstance = {
  left: number;
  top: number;
  destructor: () => void;
};

type PositionStatic = {
  (this: PositionInstance, left: number, top: number): void;
  getPooled: (left: number, top: number) => PositionInstance;
  release: (instance: PositionInstance) => void;
};

function Position(this: PositionInstance, left: number, top: number) {
  this.left = left;
  this.top = top;
}

Position.prototype.destructor = function (this: {
  left: Nullable<number>;
  top: Nullable<number>;
}) {
  this.left = null;
  this.top = null;
};

PooledClass.addPoolingTo(Position, twoArgumentPooler);

export default Position as PositionStatic;
