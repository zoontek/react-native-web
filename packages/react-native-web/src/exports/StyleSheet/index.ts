/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as RN from 'react-native';
import { styleq, type StyleqResult, type Styles } from 'styleq';
import {
  localizeStyle,
  type LocalizedStyle
} from 'styleq/transform-localize-style';

import canUseDOM from '../../modules/canUseDom';
import type { Except, GenericStyleProp } from '../../types';
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

const absoluteFill = create({
  x: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }
}).x;

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
function flatten(style: unknown): Style {
  const flatArray = [style].flat(Infinity);
  const result: Style = {};

  for (const style of flatArray) {
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
  return { id: sheet.id, textContent: sheet.getTextContent() };
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

function resolve(
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

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: { resolveRNStyle?: typeof flatten };
  }
}

if (canUseDOM && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.resolveRNStyle = flatten;
}

const Stylesheet: Except<
  typeof RN.StyleSheet,
  'absoluteFill' | 'create' | 'compose' | 'flatten'
> & {
  /**
   * A very common pattern is to create overlays with position absolute and zero positioning,
   * so `absoluteFill` can be used for convenience and to reduce duplication of these repeated
   * styles.
   */
  absoluteFill: StyleObject;

  /**
   * Compiles the styles into CSS rules, inserts them into the style sheet,
   * and returns the given object.
   */
  create: typeof create;

  /**
   * Combines two styles such that style2 will override any styles in style1.
   * If either style is falsy, the other one is returned without allocating
   * an array, saving allocations and maintaining reference equality for
   * PureComponent checks.
   */
  compose: typeof compose;

  /**
   * Flattens an array of style objects, into one aggregated style object.
   *
   * Example:
   * ```
   * const styles = StyleSheet.create({
   *   listItem: {
   *     flex: 1,
   *     fontSize: 16,
   *     color: 'white'
   *   },
   *   selectedListItem: {
   *     color: 'green'
   *   }
   * });
   *
   * StyleSheet.flatten([styles.listItem, styles.selectedListItem])
   * // returns { flex: 1, fontSize: 16, color: 'green' }
   * ```
   */
  flatten: typeof flatten;

  /**
   * Resolves style objects to the `className` and `style` props to apply
   * to a DOM element.
   */
  resolve: typeof resolve;

  /**
   * Returns the id and the text content of the style sheet, so it can be
   * inserted into the HTML during server-side rendering.
   */
  getSheet: typeof getSheet;
} = {
  // `hairlineWidth` is not implemented using screen density as browsers may
  // round sub-pixel values down to `0`, causing the line not to be rendered.
  hairlineWidth: 1,
  setStyleAttributePreprocessor() {},

  absoluteFill,
  create,
  compose,
  flatten,

  resolve,
  getSheet
};

export default Stylesheet;
