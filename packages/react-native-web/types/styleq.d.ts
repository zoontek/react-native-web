/**
 * Copyright (c) Nicolas Gallagher
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module 'styleq' {
  export type CompiledStyle = {
    $$css: true;
    [key: string]: string | true;
  };

  export type InlineStyle = {
    $$css?: never;
    [key: string]: number | string | undefined;
  };

  export type EitherStyle = CompiledStyle | InlineStyle;

  export type StylesArray<T> = T | ReadonlyArray<StylesArray<T>>;
  export type Styles = StylesArray<EitherStyle | false | void>;
  export type Style<T = EitherStyle> = StylesArray<
    false | T | null | undefined
  >;

  export type StyleqOptions = {
    disableCache?: boolean;
    disableMix?: boolean;
    transform?: (style: EitherStyle) => EitherStyle;
  };

  export type StyleqResult = [string, InlineStyle | null];
  export type Styleq = (styles: Styles) => StyleqResult;

  export type IStyleq = {
    (...styles: ReadonlyArray<Styles>): StyleqResult;
    factory: (options?: StyleqOptions) => Styleq;
  };

  export const styleq: IStyleq;
}

declare module 'styleq/transform-localize-style' {
  import type { EitherStyle } from 'styleq';

  export type LocalizableValue<T> = T | readonly [T, T];

  export type LocalizedStyle = {
    $$css$localize: true;
    [key: string]: LocalizableValue<string | number> | true;
  };

  export function localizeStyle(
    style: EitherStyle | LocalizedStyle,
    isRTL: boolean
  ): EitherStyle;
}
