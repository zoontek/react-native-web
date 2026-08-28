/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ColorValue, GenericStyleProp, Nullable } from '../../types';
import type { ViewProps, ViewStyle } from '../View/types';

type FontWeightValue =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

type NumberOrString = number | string;

export type TextStyle = ViewStyle & {
  color?: Nullable<ColorValue>;
  fontFamily?: Nullable<string>;
  fontFeatureSettings?: Nullable<string>;
  fontSize?: Nullable<NumberOrString>;
  fontStyle?: 'italic' | 'normal';
  fontWeight?: Nullable<FontWeightValue>;
  fontVariant?: Array<
    | 'small-caps'
    | 'oldstyle-nums'
    | 'lining-nums'
    | 'tabular-nums'
    | 'proportional-nums'
  >;
  hyphenateCharacter?: Nullable<string>;
  hyphens?: Nullable<'auto' | 'manual' | 'none'>;
  initialLetter?: Nullable<NumberOrString>;
  letterSpacing?: Nullable<NumberOrString>;
  lineClamp?: Nullable<number>;
  lineHeight?: Nullable<NumberOrString>;
  rubyPosition?: Nullable<'alternate' | 'over' | 'under'>;
  textAlign?:
    | 'center'
    | 'end'
    | 'inherit'
    | 'justify'
    | 'justify-all'
    | 'left'
    | 'right'
    | 'start';
  textDecorationColor?: Nullable<ColorValue>;
  textDecorationLine?:
    | 'none'
    | 'underline'
    | 'line-through'
    | 'underline line-through';
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
  textEmphasis?: Nullable<string>;
  textEmphasisColor?: Nullable<ColorValue>;
  textEmphasisPosition?: Nullable<string>;
  textEmphasisStyle?: Nullable<string>;
  textIndent?: Nullable<NumberOrString>;
  textOverflow?: Nullable<string>;
  textRendering?:
    | 'auto'
    | 'geometricPrecision'
    | 'optimizeLegibility'
    | 'optimizeSpeed';
  textShadow?: Nullable<string>;
  textShadowColor?: Nullable<ColorValue>;
  textShadowOffset?: { width?: number; height?: number };
  textShadowRadius?: Nullable<number>;
  textSizeAdjust?: Nullable<NumberOrString>;
  textTransform?: 'capitalize' | 'lowercase' | 'none' | 'uppercase';
  unicodeBidi?:
    | 'normal'
    | 'bidi-override'
    | 'embed'
    | 'isolate'
    | 'isolate-override'
    | 'plaintext';
  userSelect?: 'none' | 'text';
  verticalAlign?: Nullable<string>;
  whiteSpace?: Nullable<string>;
  wordBreak?: 'normal' | 'break-all' | 'break-word' | 'keep-all';
  wordWrap?: Nullable<string>;
  writingDirection?: 'auto' | 'ltr' | 'rtl';
  /* @platform web */
  MozOsxFontSmoothing?: Nullable<string>;
  WebkitFontSmoothing?: Nullable<string>;
  // deprecated
  textAlignVertical?: Nullable<string>;
};

export type TextProps = Omit<ViewProps, 'dir' | 'style'> & {
  dir?: 'auto' | 'ltr' | 'rtl';
  numberOfLines?: Nullable<number>;
  style?: GenericStyleProp<TextStyle>;
  testID?: Nullable<string>;
  onPress?: (e: unknown) => void;
  selectable?: boolean;
};
