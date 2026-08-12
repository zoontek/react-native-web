/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

/*
 * @returns {bool} true if different, false if equal
 */
const deepDiffer = function (
  one: unknown,
  two: unknown,
  maxDepth: number = -1
): boolean {
  if (maxDepth === 0) {
    return true;
  }
  if (one === two) {
    // Short circuit on identical object references instead of traversing them.
    return false;
  }
  if (typeof one === 'function' && typeof two === 'function') {
    // We consider all functions equal
    return false;
  }
  if (typeof one !== 'object' || one === null) {
    // Primitives can be directly compared
    return one !== two;
  }
  if (typeof two !== 'object' || two === null) {
    // We know they are different because the previous case would have triggered
    // otherwise.
    return true;
  }
  if (one.constructor !== two.constructor) {
    return true;
  }
  if (Array.isArray(one) && Array.isArray(two)) {
    // We know two is also an array because the constructors are equal
    const len = one.length;
    if (two.length !== len) {
      return true;
    }
    for (let ii = 0; ii < len; ii++) {
      if (deepDiffer(one[ii], two[ii], maxDepth - 1)) {
        return true;
      }
    }
  } else {
    const oneObject = one as Record<string, unknown>;
    const twoObject = two as Record<string, unknown>;
    for (const key in oneObject) {
      if (deepDiffer(oneObject[key], twoObject[key], maxDepth - 1)) {
        return true;
      }
    }
    for (const twoKey in twoObject) {
      // The only case we haven't checked yet is keys that are in two but aren't
      // in one, which means they are different.
      if (oneObject[twoKey] === undefined && twoObject[twoKey] !== undefined) {
        return true;
      }
    }
  }
  return false;
};

export default deepDiffer;
