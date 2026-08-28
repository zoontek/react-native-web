/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isUnitlessNumber from '../../../modules/isUnitlessNumber';
import type { Nullable } from '../../../types';
import normalizeColor from './normalizeColor';

export type StyleValue =
  | number
  | string
  | Array<StyleValue>
  | { [key: string]: StyleValue | null | undefined };

const colorProps: Record<string, boolean> = {
  backgroundColor: true,
  borderBottomColor: true,
  borderColor: true,
  borderLeftColor: true,
  borderRightColor: true,
  borderTopColor: true,
  color: true,
  shadowColor: true,
  textDecorationColor: true,
  textEmphasisColor: true,
  textShadowColor: true
};

export default function normalizeValueWithProperty<
  T extends StyleValue | null | undefined
>(value: T, property?: Nullable<string>): T | string | undefined {
  if (
    (property == null || !isUnitlessNumber(property)) &&
    typeof value === 'number'
  ) {
    return `${value}px`;
  }
  if (property != null && colorProps[property]) {
    return typeof value === 'object' ? undefined : normalizeColor(value);
  }
  return value;
}
