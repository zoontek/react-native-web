/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type ForwardedRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode
} from 'react';

import useHover, { type HoverEventsConfig } from '../../modules/useHover';
import useMergeRefs from '../../modules/useMergeRefs';
import usePressEvents from '../../modules/usePressEvents';
import type {
  EventHandlers,
  PressResponderConfig
} from '../../modules/usePressEvents/PressResponder';
import type { Nullable, PlatformMethods } from '../../types';
import StyleSheet from '../StyleSheet';
import View, { type ViewProps } from '../View';

export type StateCallbackType = Readonly<{
  focused: boolean;
  hovered: boolean;
  pressed: boolean;
}>;

type ViewStyleProp = ViewProps['style'];

type PressKeyboardEvent = Parameters<EventHandlers['onKeyDown']>[0];

type Props = Omit<ViewProps, 'children' | 'style'> & {
  children?: ReactNode | ((state: StateCallbackType) => ReactNode);
  // Duration (in milliseconds) from `onPressIn` before `onLongPress` is called.
  delayLongPress?: Nullable<number>;
  // Duration (in milliseconds) from `onPressStart` is called after pointerdown
  delayPressIn?: Nullable<number>;
  // Duration (in milliseconds) from `onPressEnd` is called after pointerup.
  delayPressOut?: Nullable<number>;
  // Whether the press behavior is disabled.
  disabled?: Nullable<boolean>;
  // Called when the view is hovered
  onHoverIn?: HoverEventsConfig['onHoverStart'];
  // Called when the view is no longer hovered
  onHoverOut?: HoverEventsConfig['onHoverEnd'];
  // Called when this view's layout changes
  onLayout?: ViewProps['onLayout'];
  // Called when a long-tap gesture is detected.
  onLongPress?: PressResponderConfig['onLongPress'];
  // Called when a single tap gesture is detected.
  onPress?: PressResponderConfig['onPress'];
  // Called when a touch is engaged, before `onPress`.
  onPressIn?: PressResponderConfig['onPressStart'];
  // Called when a touch is moving, after `onPressIn`.
  onPressMove?: PressResponderConfig['onPressMove'];
  // Called when a touch is released, before `onPress`.
  onPressOut?: PressResponderConfig['onPressEnd'];
  style?: ViewStyleProp | ((state: StateCallbackType) => ViewStyleProp);
  /**
   * Used only for documentation or testing (e.g. snapshot testing).
   */
  testOnly_hovered?: Nullable<boolean>;
  testOnly_pressed?: Nullable<boolean>;
};

/**
 * Component used to build display components that should respond to whether the
 * component is currently pressed or not.
 */
function Pressable(
  props: Props,
  forwardedRef: ForwardedRef<HTMLElement & PlatformMethods>
): ReactNode {
  const {
    children,
    delayLongPress,
    delayPressIn,
    delayPressOut,
    disabled,
    onBlur,
    onContextMenu,
    onFocus,
    onHoverIn,
    onHoverOut,
    onKeyDown,
    onLongPress,
    onPress,
    onPressMove,
    onPressIn,
    onPressOut,
    style,
    tabIndex,
    testOnly_hovered,
    testOnly_pressed,
    ...rest
  } = props;

  const [hovered, setHovered] = useForceableState(testOnly_hovered === true);
  const [focused, setFocused] = useForceableState(false);
  const [pressed, setPressed] = useForceableState(testOnly_pressed === true);

  const hostRef = useRef<(HTMLElement & PlatformMethods) | null>(null);
  const setRef = useMergeRefs(forwardedRef, hostRef);

  const pressConfig = useMemo(
    () => ({
      delayLongPress,
      delayPressStart: delayPressIn,
      delayPressEnd: delayPressOut,
      disabled,
      onLongPress,
      onPress,
      onPressChange: setPressed,
      onPressStart: onPressIn,
      onPressMove,
      onPressEnd: onPressOut
    }),
    [
      delayLongPress,
      delayPressIn,
      delayPressOut,
      disabled,
      onLongPress,
      onPress,
      onPressIn,
      onPressMove,
      onPressOut,
      setPressed
    ]
  );

  const pressEventHandlers = usePressEvents(hostRef, pressConfig);

  const { onContextMenu: onContextMenuPress, onKeyDown: onKeyDownPress } =
    pressEventHandlers;

  useHover(hostRef, {
    contain: true,
    disabled,
    onHoverChange: setHovered,
    onHoverStart: onHoverIn,
    onHoverEnd: onHoverOut
  });

  const interactionState = { hovered, focused, pressed };

  const blurHandler = useCallback(
    (e: FocusEvent<HTMLElement>) => {
      if (e.nativeEvent.target === hostRef.current) {
        setFocused(false);
        if (onBlur != null) {
          onBlur(e);
        }
      }
    },
    [hostRef, setFocused, onBlur]
  );

  const focusHandler = useCallback(
    (e: FocusEvent<HTMLElement>) => {
      if (e.nativeEvent.target === hostRef.current) {
        setFocused(true);
        if (onFocus != null) {
          onFocus(e);
        }
      }
    },
    [hostRef, setFocused, onFocus]
  );

  const contextMenuHandler = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (onContextMenuPress != null) {
        onContextMenuPress(e);
      }
      if (onContextMenu != null) {
        onContextMenu(e);
      }
    },
    [onContextMenu, onContextMenuPress]
  );

  const keyDownHandler = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (onKeyDownPress != null) {
        onKeyDownPress(e as unknown as PressKeyboardEvent);
      }
      if (onKeyDown != null) {
        onKeyDown(e);
      }
    },
    [onKeyDown, onKeyDownPress]
  );

  let _tabIndex: ViewProps['tabIndex'];
  if (tabIndex !== undefined) {
    _tabIndex = tabIndex;
  } else {
    _tabIndex = disabled ? -1 : 0;
  }

  return (
    <View
      {...rest}
      {...pressEventHandlers}
      aria-disabled={disabled}
      onBlur={blurHandler}
      onContextMenu={contextMenuHandler}
      onFocus={focusHandler}
      onKeyDown={keyDownHandler}
      ref={setRef}
      style={[
        disabled ? styles.disabled : styles.active,
        typeof style === 'function' ? style(interactionState) : style
      ]}
      tabIndex={_tabIndex}
    >
      {typeof children === 'function' ? children(interactionState) : children}
    </View>
  );
}

function useForceableState(
  forced: boolean
): [boolean, (value: boolean) => void] {
  const [bool, setBool] = useState(false);
  return [bool || forced, setBool];
}

const styles = StyleSheet.create({
  active: {
    cursor: 'pointer',
    touchAction: 'manipulation'
  },
  disabled: {
    pointerEvents: 'box-none'
  }
});

const MemoedPressable = memo(forwardRef(Pressable));
MemoedPressable.displayName = 'Pressable';

export default MemoedPressable;
