/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Ref } from 'react';

import type { PlatformMethods } from '../../types';
import StyleSheet from '../StyleSheet';
import View, { type ViewProps } from '../View';

const SafeAreaView = (
  props: ViewProps & { ref?: Ref<HTMLElement & PlatformMethods> }
) => {
  const { ref, style, ...rest } = props;
  return <View {...rest} ref={ref} style={[styles.root, style]} />;
};

SafeAreaView.displayName = 'SafeAreaView';

const styles = StyleSheet.create({
  root: {
    paddingTop: 'env(safe-area-inset-top)',
    paddingRight: 'env(safe-area-inset-right)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)'
  }
});

export default SafeAreaView;
