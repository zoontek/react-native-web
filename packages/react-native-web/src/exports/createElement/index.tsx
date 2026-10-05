/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import {
  createElement as reactCreateElement,
  type ElementType,
  type ReactNode
} from 'react';

import AccessibilityUtil from '../../modules/AccessibilityUtil';
import createDOMProps, {
  type ElementProps
} from '../../modules/createDOMProps';
import { LocaleProvider } from '../../modules/useLocale';
import type { Options } from '../StyleSheet';

const createElement = (
  component: ElementType,
  props?: ElementProps,
  options?: Options
): ReactNode => {
  // Use equivalent platform elements where possible.
  let accessibilityComponent: string | undefined;
  if (component && component.constructor === String) {
    accessibilityComponent =
      AccessibilityUtil.propsToAccessibilityComponent(props);
  }
  const Component = accessibilityComponent || component;
  const domProps = createDOMProps(Component, props, options);

  const element = reactCreateElement(Component, domProps);

  // Update locale context if element's writing direction prop changes
  const elementWithLocaleProvider = domProps.dir ? (
    <LocaleProvider
      children={element}
      direction={domProps.dir}
      locale={domProps.lang}
    />
  ) : (
    element
  );

  return elementWithLocaleProvider;
};

export default createElement;
