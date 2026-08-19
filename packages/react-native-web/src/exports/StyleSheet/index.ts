/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { styleq } from 'styleq';
import type { Styles, StyleqResult } from 'styleq';
import { localizeStyle } from 'styleq/transform-localize-style';
import type { LocalizedStyle } from 'styleq/transform-localize-style';

import canUseDOM from '../../modules/canUseDom';
import type { GenericStyleProp } from '../../types';
import { atomic, classic, inline } from './compiler';
import type { Style } from './compiler/createReactDOMStyle';
import type { StyleValue } from './compiler/normalizeValueWithProperty';
import { createSheet } from './dom';
import { preprocess } from './preprocess';
import { validate } from './validate';

export type StyleObject = {
  [key: string]: StyleValue | boolean | null | undefined;
};

const staticStyleMap = new WeakMap<object, LocalizedStyle>();
const sheet = createSheet();

const defaultPreprocessOptions = { shadow: true, textShadow: true };

function customStyleq(
  styles: GenericStyleProp<StyleObject>,
  options: Options = {}
): StyleqResult {
  const { writingDirection, ...preprocessOptions } = options;
  const isRTL = writingDirection === 'rtl';
  return styleq.factory({
    transform(style) {
      const compiledStyle = staticStyleMap.get(style);
      if (compiledStyle != null) {
        return localizeStyle(compiledStyle, isRTL);
      }
      return preprocess(style, {
        ...defaultPreprocessOptions,
        ...preprocessOptions
      });
    }
  })(styles as Styles);
}

function insertRules(compiledOrderedRules: Array<[Array<string>, number]>) {
  compiledOrderedRules.forEach(([rules, order]) => {
    if (sheet != null) {
      rules.forEach((rule) => {
        sheet.insert(rule, order);
      });
    }
  });
}

function compileAndInsertAtomic(style: Style) {
  const [compiledStyle, compiledOrderedRules] = atomic(
    preprocess(style, defaultPreprocessOptions)
  );
  insertRules(compiledOrderedRules);
  return compiledStyle;
}

function compileAndInsertReset(style: Style, key: string) {
  const [compiledStyle, compiledOrderedRules] = classic(style, key);
  insertRules(compiledOrderedRules);
  return compiledStyle;
}

/* ----- API ----- */

const absoluteFillObject = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0
};

const absoluteFill = create({ x: { ...absoluteFillObject } }).x;

/**
 * create
 */
function create<const T extends Record<string, StyleObject>>(
  styles: T
): Readonly<T> {
  Object.keys(styles).forEach((key) => {
    const styleObj = styles[key];
    // Only compile at runtime if the style is not already compiled
    if (styleObj != null && styleObj.$$css !== true) {
      let compiledStyles;
      if (key.indexOf('$raw') > -1) {
        compiledStyles = compileAndInsertReset(
          styleObj as Style,
          key.split('$raw')[0] ?? ''
        );
      } else {
        if (process.env.NODE_ENV !== 'production') {
          validate(styleObj);
          (styles as Record<string, StyleObject>)[key] =
            Object.freeze(styleObj);
        }
        compiledStyles = compileAndInsertAtomic(styleObj as Style);
      }
      staticStyleMap.set(styleObj, compiledStyles as LocalizedStyle);
    }
  });
  return styles;
}

/**
 * compose
 */
function compose<T, U>(style1: T, style2: U): [T, U] {
  if (process.env.NODE_ENV !== 'production') {
    const len = arguments.length;
    if (len > 2) {
      // oxlint-disable-next-line prefer-rest-params
      const readableStyles = [...arguments].map((a) => flatten(a));
      throw new Error(
        `StyleSheet.compose() only accepts 2 arguments, received ${len}: ${JSON.stringify(
          readableStyles
        )}`
      );
    }
  }
  return [style1, style2];
}

/**
 * flatten
 */
function flatten(...styles: Array<unknown>): Style {
  const flatArray = styles.flat(Infinity);
  const result: Style = {};
  for (let i = 0; i < flatArray.length; i++) {
    const style = flatArray[i];
    if (style != null && typeof style === 'object') {
      Object.assign(result, style);
    }
  }
  return result;
}

/**
 * getSheet
 */
function getSheet(): { id: string; textContent: string } {
  return {
    id: sheet.id,
    textContent: sheet.getTextContent()
  };
}

/**
 * resolve
 */
type StyleProps = [string, Style | null];

export type Options = {
  shadow?: boolean;
  textShadow?: boolean;
  writingDirection?: 'auto' | 'ltr' | 'rtl';
};

function StyleSheet(
  styles: GenericStyleProp<StyleObject>,
  options: Options = {}
): StyleProps {
  const isRTL = options.writingDirection === 'rtl';
  const styleProps: StyleProps = customStyleq(styles, options);
  if (Array.isArray(styleProps) && styleProps[1] != null) {
    styleProps[1] = inline(styleProps[1], isRTL);
  }
  return styleProps;
}

StyleSheet.absoluteFill = absoluteFill;
StyleSheet.absoluteFillObject = absoluteFillObject;
StyleSheet.create = create;
StyleSheet.compose = compose;
StyleSheet.flatten = flatten;
StyleSheet.getSheet = getSheet;
// `hairlineWidth` is not implemented using screen density as browsers may
// round sub-pixel values down to `0`, causing the line not to be rendered.
StyleSheet.hairlineWidth = 1;

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: { resolveRNStyle?: typeof flatten };
  }
}

if (canUseDOM && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.resolveRNStyle = StyleSheet.flatten;
}

export type IStyleSheet = {
  (styles?: GenericStyleProp<StyleObject>, options?: Options): StyleProps;
  absoluteFill: StyleObject;
  absoluteFillObject: StyleObject;
  create: typeof create;
  compose: typeof compose;
  flatten: typeof flatten;
  getSheet: typeof getSheet;
  hairlineWidth: number;
};

const stylesheet: IStyleSheet = StyleSheet;

export default stylesheet;
