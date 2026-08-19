/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import type { ComponentProps, ComponentRef } from 'react';

import ScrollView from '../../../../exports/ScrollView';
import createAnimatedComponent, {
  type AnimatedComponentType
} from '../createAnimatedComponent';

/**
 * @see https://github.com/facebook/react-native/commit/b8c8562
 */
const ScrollViewWithEventThrottle = (
  props: ComponentProps<typeof ScrollView>
) => <ScrollView scrollEventThrottle={0.0001} {...props} />;

export default createAnimatedComponent(
  ScrollViewWithEventThrottle
) as AnimatedComponentType<
  ComponentProps<typeof ScrollView>,
  ComponentRef<typeof ScrollView>
>;
