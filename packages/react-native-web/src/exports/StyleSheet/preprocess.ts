/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { warnOnce } from '../../modules/warnOnce';
import type { Nullable } from '../../types';
import type { Style } from './compiler/createReactDOMStyle';
import normalizeColor from './compiler/normalizeColor';
import normalizeValueWithProperty from './compiler/normalizeValueWithProperty';

type ShadowOffset = {
  height?: Nullable<number | string>;
  width?: Nullable<number | string>;
};

type ShadowStyle = {
  shadowColor?: Nullable<number | string>;
  shadowOffset?: Nullable<ShadowOffset>;
  shadowOpacity?: number;
  shadowRadius?: Nullable<number | string>;
};

type TextShadowStyle = {
  textShadowColor?: Nullable<number | string>;
  textShadowOffset?: Nullable<ShadowOffset>;
  textShadowRadius?: Nullable<number | string>;
};

type BoxShadow = {
  offsetX?: Nullable<number | string>;
  offsetY?: Nullable<number | string>;
  blurRadius?: Nullable<number | string>;
  spreadDistance?: Nullable<number | string>;
  color?: Nullable<number | string>;
  inset?: Nullable<boolean>;
};

const emptyObject: Record<string, unknown> = {};

/**
 * Shadows
 */

const defaultOffset = { height: 0, width: 0 };

export const createBoxShadowValue = (
  style: ShadowStyle
): undefined | string => {
  const { shadowColor, shadowOffset, shadowOpacity, shadowRadius } = style;
  const { height, width } = shadowOffset || defaultOffset;
  const offsetX = normalizeValueWithProperty(width);
  const offsetY = normalizeValueWithProperty(height);
  const blurRadius = normalizeValueWithProperty(shadowRadius || 0);
  const color = normalizeColor(shadowColor || 'black', shadowOpacity);
  if (
    color != null &&
    offsetX != null &&
    offsetY != null &&
    blurRadius != null
  ) {
    return `${offsetX} ${offsetY} ${blurRadius} ${color}`;
  }
};

export const createTextShadowValue = (
  style: TextShadowStyle
): undefined | string => {
  const { textShadowColor, textShadowOffset, textShadowRadius } = style;
  const { height, width } = textShadowOffset || defaultOffset;
  const radius = textShadowRadius || 0;
  const offsetX = normalizeValueWithProperty(width);
  const offsetY = normalizeValueWithProperty(height);
  const blurRadius = normalizeValueWithProperty(radius);
  const color = normalizeValueWithProperty(textShadowColor, 'textShadowColor');

  if (
    color &&
    (height !== 0 || width !== 0 || radius !== 0) &&
    offsetX != null &&
    offsetY != null &&
    blurRadius != null
  ) {
    return `${offsetX} ${offsetY} ${blurRadius} ${color}`;
  }
};

// { offsetX: 1, offsetY: 2, blurRadius: 3, spreadDistance: 4, color: 'rgba(255, 0, 0)', inset: true }
// => 'rgba(255, 0, 0) 1px 2px 3px 4px inset'
const mapBoxShadow = (boxShadow: BoxShadow | string): string => {
  if (typeof boxShadow === 'string') {
    return boxShadow;
  }
  const offsetX = normalizeValueWithProperty(boxShadow.offsetX) || 0;
  const offsetY = normalizeValueWithProperty(boxShadow.offsetY) || 0;
  const blurRadius = normalizeValueWithProperty(boxShadow.blurRadius) || 0;
  const spreadDistance =
    normalizeValueWithProperty(boxShadow.spreadDistance) || 0;
  const color = normalizeColor(boxShadow.color) || 'black';
  const position = boxShadow.inset ? 'inset ' : '';
  return `${position}${offsetX} ${offsetY} ${blurRadius} ${spreadDistance} ${color}`;
};
export const createBoxShadowArrayValue = (
  value: Array<BoxShadow | string>
): string => {
  return value.map(mapBoxShadow).join(', ');
};

// { scale: 2 } => 'scale(2)'
// { translateX: 20 } => 'translateX(20px)'
// { matrix: [1,2,3,4,5,6] } => 'matrix(1,2,3,4,5,6)'
const mapTransform = (transform: Style): string => {
  const type = Object.keys(transform)[0] ?? '';
  const value = transform[type];
  if (type === 'matrix' || type === 'matrix3d') {
    return `${type}(${(value as Array<number>).join(',')})`;
  } else {
    const normalizedValue = normalizeValueWithProperty(value, type);
    return `${type}(${normalizedValue as string})`;
  }
};

export const createTransformValue = (value: Array<Style>): string => {
  return value.map(mapTransform).join(' ');
};

// [2, '30%', 10] => '2px 30% 10px'
export const createTransformOriginValue = (
  value: Array<number | string>
): string => {
  return value.map((v) => normalizeValueWithProperty(v)).join(' ');
};

const PROPERTIES_STANDARD: Record<string, string> = {
  borderBottomEndRadius: 'borderEndEndRadius',
  borderBottomStartRadius: 'borderEndStartRadius',
  borderTopEndRadius: 'borderStartEndRadius',
  borderTopStartRadius: 'borderStartStartRadius',
  borderEndColor: 'borderInlineEndColor',
  borderEndStyle: 'borderInlineEndStyle',
  borderEndWidth: 'borderInlineEndWidth',
  borderStartColor: 'borderInlineStartColor',
  borderStartStyle: 'borderInlineStartStyle',
  borderStartWidth: 'borderInlineStartWidth',
  end: 'insetInlineEnd',
  marginEnd: 'marginInlineEnd',
  marginHorizontal: 'marginInline',
  marginStart: 'marginInlineStart',
  marginVertical: 'marginBlock',
  paddingEnd: 'paddingInlineEnd',
  paddingHorizontal: 'paddingInline',
  paddingStart: 'paddingInlineStart',
  paddingVertical: 'paddingBlock',
  start: 'insetInlineStart'
};

const ignoredProps: Record<string, boolean> = {
  elevation: true,
  overlayColor: true,
  resizeMode: true,
  tintColor: true
};

/**
 * Preprocess styles
 */
export const preprocess = <T extends Record<string, unknown>>(
  originalStyle: T,
  options: { shadow?: boolean; textShadow?: boolean } = {}
): T => {
  const style = originalStyle || emptyObject;
  const nextStyle: Record<string, unknown> = {};

  // Convert shadow styles
  if (
    (options.shadow === true,
    style.shadowColor != null ||
      style.shadowOffset != null ||
      style.shadowOpacity != null ||
      style.shadowRadius != null)
  ) {
    warnOnce(
      'shadowStyles',
      `"shadow*" style props are deprecated. Use "boxShadow".`
    );
    const boxShadowValue = createBoxShadowValue(style);
    if (boxShadowValue != null) {
      nextStyle.boxShadow = boxShadowValue;
    }
  }

  // Convert text shadow styles
  if (
    (options.textShadow === true,
    style.textShadowColor != null ||
      style.textShadowOffset != null ||
      style.textShadowRadius != null)
  ) {
    warnOnce(
      'textShadowStyles',
      `"textShadow*" style props are deprecated. Use "textShadow".`
    );
    const textShadowValue = createTextShadowValue(style);
    if (textShadowValue != null && nextStyle.textShadow == null) {
      const { textShadow } = style;
      const value = textShadow
        ? `${textShadow as string}, ${textShadowValue}`
        : textShadowValue;
      nextStyle.textShadow = value;
    }
  }

  for (const originalProp in style) {
    if (
      // Ignore some React Native styles
      ignoredProps[originalProp] != null ||
      originalProp === 'shadowColor' ||
      originalProp === 'shadowOffset' ||
      originalProp === 'shadowOpacity' ||
      originalProp === 'shadowRadius' ||
      originalProp === 'textShadowColor' ||
      originalProp === 'textShadowOffset' ||
      originalProp === 'textShadowRadius'
    ) {
      continue;
    }

    const originalValue = style[originalProp];
    const prop = PROPERTIES_STANDARD[originalProp] || originalProp;
    let value: unknown = originalValue;

    if (
      !Object.prototype.hasOwnProperty.call(style, originalProp) ||
      (prop !== originalProp && style[prop] != null)
    ) {
      continue;
    }

    if (prop === 'aspectRatio' && typeof value === 'number') {
      nextStyle[prop] = value.toString();
    } else if (prop === 'boxShadow') {
      if (Array.isArray(value)) {
        value = createBoxShadowArrayValue(value);
      }
      const { boxShadow } = nextStyle;
      nextStyle.boxShadow = boxShadow
        ? `${value as string}, ${boxShadow as string}`
        : value;
    } else if (prop === 'fontVariant') {
      if (Array.isArray(value) && value.length > 0) {
        value = value.join(' ');
      }
      nextStyle[prop] = value;
    } else if (prop === 'textAlignVertical') {
      if (style.verticalAlign == null) {
        nextStyle.verticalAlign = value === 'center' ? 'middle' : value;
      }
    } else if (prop === 'transform') {
      if (Array.isArray(value)) {
        value = createTransformValue(value);
      }
      nextStyle.transform = value;
    } else if (prop === 'transformOrigin') {
      if (Array.isArray(value)) {
        value = createTransformOriginValue(value);
      }
      nextStyle.transformOrigin = value;
    } else {
      nextStyle[prop] = value;
    }
  }

  return nextStyle as T;
};

export default preprocess;
