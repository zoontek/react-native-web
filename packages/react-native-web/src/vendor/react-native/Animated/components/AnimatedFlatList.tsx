/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import type {
  ComponentProps,
  ComponentPropsWithRef,
  ComponentRef
} from 'react';

import FlatList from '../../../../exports/FlatList';
import createAnimatedComponent, {
  type AnimatedComponentType
} from '../createAnimatedComponent';

/**
 * @see https://github.com/facebook/react-native/commit/b8c8562
 */
const FlatListWithEventThrottle = (
  props: ComponentPropsWithRef<typeof FlatList>
) => <FlatList scrollEventThrottle={0.0001} {...props} />;

export default createAnimatedComponent(
  FlatListWithEventThrottle
) as AnimatedComponentType<
  ComponentProps<typeof FlatList>,
  ComponentRef<typeof FlatList>
>;
