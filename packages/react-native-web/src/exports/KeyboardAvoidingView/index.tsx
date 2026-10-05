/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import { Component, type ReactNode } from 'react';

import type { LayoutEvent, LayoutValue, Nullable } from '../../types';
import View, { type ViewProps } from '../View';

type KeyboardAvoidingViewProps = ViewProps & {
  behavior?: 'height' | 'padding' | 'position';
  contentContainerStyle?: ViewProps['style'];
  keyboardVerticalOffset: number;
};

class KeyboardAvoidingView extends Component<KeyboardAvoidingViewProps> {
  frame: Nullable<LayoutValue> = null;

  relativeKeyboardHeight(keyboardFrame: Nullable<{ screenY: number }>): number {
    const frame = this.frame;
    if (!frame || !keyboardFrame) {
      return 0;
    }
    const keyboardY =
      keyboardFrame.screenY - (this.props.keyboardVerticalOffset || 0);
    return Math.max(frame.y + frame.height - keyboardY, 0);
  }

  onKeyboardChange(event: unknown) {}

  onLayout: (event: LayoutEvent) => void = (event: LayoutEvent) => {
    this.frame = event.nativeEvent.layout;
  };

  render(): ReactNode {
    // oxlint-disable-next-line no-unused-vars
    const { behavior, contentContainerStyle, keyboardVerticalOffset, ...rest } =
      this.props;

    return <View onLayout={this.onLayout} {...rest} />;
  }
}

export default KeyboardAvoidingView;
