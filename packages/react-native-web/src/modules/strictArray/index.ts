/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default function strictArray<T extends string>(
  object: Record<T, null>
): Array<T> {
  return Object.keys(object) as Array<T>;
}
