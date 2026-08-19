/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use client';

import type { ForwardedRef, ReactElement, ReactNode, Ref } from 'react';
import {
  Children,
  cloneElement,
  forwardRef,
  memo,
  useMemo,
  useRef
} from 'react';

import type { ElementProps } from '../../modules/createDOMProps';
import pick from '../../modules/pick';
import useMergeRefs from '../../modules/useMergeRefs';
import usePressEvents from '../../modules/usePressEvents';
import type { PressResponderConfig } from '../../modules/usePressEvents/PressResponder';
import { warnOnce } from '../../modules/warnOnce';
import type { Nullable, PlatformMethods } from '../../types';
import type { ViewProps } from '../View';

export type Props = Readonly<{
  accessibilityLabel?: ViewProps['accessibilityLabel'];
  accessibilityLiveRegion?: ViewProps['accessibilityLiveRegion'];
  accessibilityRole?: ViewProps['accessibilityRole'];
  children?: Nullable<ReactNode>;
  delayLongPress?: Nullable<number>;
  delayPressIn?: Nullable<number>;
  delayPressOut?: Nullable<number>;
  disabled?: Nullable<boolean>;
  focusable?: Nullable<boolean>;
  nativeID?: ViewProps['nativeID'];
  onBlur?: ViewProps['onBlur'];
  onFocus?: ViewProps['onFocus'];
  onLayout?: ViewProps['onLayout'];
  onLongPress?: PressResponderConfig['onLongPress'];
  onPress?: PressResponderConfig['onPress'];
  onPressIn?: PressResponderConfig['onPressStart'];
  onPressOut?: PressResponderConfig['onPressEnd'];
  rejectResponderTermination?: Nullable<boolean>;
  testID?: ViewProps['testID'];
}>;

const forwardPropsList = {
  accessibilityDisabled: true,
  accessibilityLabel: true,
  accessibilityLiveRegion: true,
  accessibilityRole: true,
  accessibilityState: true,
  accessibilityValue: true,
  children: true,
  disabled: true,
  focusable: true,
  nativeID: true,
  onBlur: true,
  onFocus: true,
  onLayout: true,
  testID: true
};

const pickProps = (props: Props): ElementProps => pick(props, forwardPropsList);

function TouchableWithoutFeedback(
  props: Props,
  forwardedRef: ForwardedRef<HTMLElement & PlatformMethods>
): ReactNode {
  warnOnce(
    'TouchableWithoutFeedback',
    'TouchableWithoutFeedback is deprecated. Please use Pressable.'
  );

  const {
    delayPressIn,
    delayPressOut,
    delayLongPress,
    disabled,
    focusable,
    onLongPress,
    onPress,
    onPressIn,
    onPressOut,
    rejectResponderTermination
  } = props;

  const hostRef = useRef<(HTMLElement & PlatformMethods) | null>(null);

  const pressConfig = useMemo(
    () => ({
      cancelable: !rejectResponderTermination,
      disabled,
      delayLongPress,
      delayPressStart: delayPressIn,
      delayPressEnd: delayPressOut,
      onLongPress,
      onPress,
      onPressStart: onPressIn,
      onPressEnd: onPressOut
    }),
    [
      disabled,
      delayPressIn,
      delayPressOut,
      delayLongPress,
      onLongPress,
      onPress,
      onPressIn,
      onPressOut,
      rejectResponderTermination
    ]
  );

  const pressEventHandlers = usePressEvents(hostRef, pressConfig);

  const element = Children.only(props.children) as ReactElement<{
    children?: Nullable<ReactNode>;
    ref?: Nullable<Ref<HTMLElement & PlatformMethods>>;
    [key: string]: unknown;
  }>;
  const children = [element.props.children];
  const supportedProps = pickProps(props);
  supportedProps.accessibilityDisabled = disabled;
  supportedProps.focusable = !disabled && focusable !== false;
  supportedProps.ref = useMergeRefs(forwardedRef, hostRef, element.props.ref);

  const elementProps = Object.assign(supportedProps, pressEventHandlers);

  return cloneElement(element, elementProps, ...children);
}

const MemoedTouchableWithoutFeedback = memo(
  forwardRef(TouchableWithoutFeedback)
);
MemoedTouchableWithoutFeedback.displayName = 'TouchableWithoutFeedback';

export default MemoedTouchableWithoutFeedback;
