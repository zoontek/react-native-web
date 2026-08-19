/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import { forwardRef, type ComponentProps, type ComponentRef } from 'react';

import SectionList from '../../../../exports/SectionList';
import createAnimatedComponent from '../createAnimatedComponent';
import type { AnimatedComponentType } from '../createAnimatedComponent';

/**
 * @see https://github.com/facebook/react-native/commit/b8c8562
 */
const SectionListWithEventThrottle = forwardRef<
  ComponentRef<typeof SectionList>,
  ComponentProps<typeof SectionList>
>((props, ref) => (
  <SectionList scrollEventThrottle={0.0001} {...props} ref={ref} />
));

export default createAnimatedComponent(
  SectionListWithEventThrottle
) as AnimatedComponentType<
  ComponentProps<typeof SectionList>,
  ComponentRef<typeof SectionList>
>;
