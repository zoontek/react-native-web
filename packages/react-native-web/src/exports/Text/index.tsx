/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import {
  useCallback,
  useContext,
  useRef,
  type ElementType,
  type MouseEvent,
  type Ref
} from 'react';

import type { ElementProps } from '../../modules/createDOMProps';
import * as forwardedProps from '../../modules/forwardedProps';
import pick from '../../modules/pick';
import useElementLayout from '../../modules/useElementLayout';
import { getLocaleDirection, useLocaleContext } from '../../modules/useLocale';
import useMergeRefs from '../../modules/useMergeRefs';
import usePlatformMethods from '../../modules/usePlatformMethods';
import useResponderEvents from '../../modules/useResponderEvents';
import type { PlatformMethods } from '../../types';
import createElement from '../createElement';
import StyleSheet from '../StyleSheet';
import TextAncestorContext from './TextAncestorContext';
import type { TextProps } from './types';

const forwardPropsList = Object.assign(
  {},
  forwardedProps.defaultProps,
  forwardedProps.accessibilityProps,
  forwardedProps.clickProps,
  forwardedProps.focusProps,
  forwardedProps.keyboardProps,
  forwardedProps.mouseProps,
  forwardedProps.touchProps,
  forwardedProps.styleProps,
  {
    href: true,
    lang: true,
    pointerEvents: true
  }
);

const pickProps = (props: TextProps): ElementProps =>
  pick(props, forwardPropsList);

const Text = (
  props: TextProps & { ref?: Ref<HTMLElement & PlatformMethods> }
) => {
  const {
    hrefAttrs,
    numberOfLines,
    onClick,
    onLayout,
    onPress,
    onMoveShouldSetResponder,
    onMoveShouldSetResponderCapture,
    onResponderEnd,
    onResponderGrant,
    onResponderMove,
    onResponderReject,
    onResponderRelease,
    onResponderStart,
    onResponderTerminate,
    onResponderTerminationRequest,
    onScrollShouldSetResponder,
    onScrollShouldSetResponderCapture,
    onSelectionChangeShouldSetResponder,
    onSelectionChangeShouldSetResponderCapture,
    onStartShouldSetResponder,
    onStartShouldSetResponderCapture,
    ref,
    selectable,
    ...rest
  } = props;

  const hasTextAncestor = useContext(TextAncestorContext);
  const hostRef = useRef<(HTMLElement & PlatformMethods) | null>(null);
  const { direction: contextDirection } = useLocaleContext();

  useElementLayout(hostRef, onLayout);
  useResponderEvents(hostRef, {
    onMoveShouldSetResponder,
    onMoveShouldSetResponderCapture,
    onResponderEnd,
    onResponderGrant,
    onResponderMove,
    onResponderReject,
    onResponderRelease,
    onResponderStart,
    onResponderTerminate,
    onResponderTerminationRequest,
    onScrollShouldSetResponder,
    onScrollShouldSetResponderCapture,
    onSelectionChangeShouldSetResponder,
    onSelectionChangeShouldSetResponderCapture,
    onStartShouldSetResponder,
    onStartShouldSetResponderCapture
  });

  const handleClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (onClick != null) {
        onClick(e);
      } else if (onPress != null) {
        e.stopPropagation();
        onPress(e);
      }
    },
    [onClick, onPress]
  );

  let component: ElementType = hasTextAncestor ? 'span' : 'div';

  const langDirection =
    props.lang != null ? getLocaleDirection(props.lang) : null;
  const componentDirection = props.dir || langDirection;
  const writingDirection = componentDirection || contextDirection;

  const supportedProps = pickProps(rest);
  supportedProps.dir = componentDirection;
  // 'auto' by default allows browsers to infer writing direction (root elements only)
  if (!hasTextAncestor) {
    supportedProps.dir =
      componentDirection != null ? componentDirection : 'auto';
  }

  if (onClick || onPress) {
    supportedProps.onClick = handleClick;
  }

  supportedProps.style = [
    numberOfLines != null &&
      numberOfLines > 1 && { WebkitLineClamp: numberOfLines },

    hasTextAncestor ? styles.textHasAncestor$raw : styles.text$raw,
    numberOfLines === 1 && styles.textOneLine,
    numberOfLines != null && numberOfLines > 1 && styles.textMultiLine,
    props.style,
    selectable === true && styles.selectable,
    selectable === false && styles.notSelectable,
    onPress && styles.pressable
  ];

  if (props.href != null) {
    component = 'a';
    if (hrefAttrs != null) {
      const { download, rel, target } = hrefAttrs;
      if (download != null) {
        supportedProps.download = download;
      }
      if (rel != null) {
        supportedProps.rel = rel;
      }
      if (typeof target === 'string') {
        supportedProps.target =
          target.charAt(0) !== '_' ? '_' + target : target;
      }
    }
  }

  const platformMethodsRef = usePlatformMethods();
  const setRef = useMergeRefs(hostRef, platformMethodsRef, ref);

  supportedProps.ref = setRef;

  const element = createElement(component, supportedProps, {
    writingDirection
  });

  return hasTextAncestor ? (
    element
  ) : (
    <TextAncestorContext.Provider value={true}>
      {element}
    </TextAncestorContext.Provider>
  );
};

Text.displayName = 'Text';

const textStyle = {
  backgroundColor: 'transparent',
  border: '0 solid black',
  boxSizing: 'border-box',
  color: 'black',
  display: 'inline',
  font: '14px System',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  position: 'relative',
  textAlign: 'start',
  textDecoration: 'none',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word'
};

const styles = StyleSheet.create({
  text$raw: textStyle,
  textHasAncestor$raw: {
    ...textStyle,
    color: 'inherit',
    font: 'inherit',
    textAlign: 'inherit',
    whiteSpace: 'inherit'
  },
  textOneLine: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    wordWrap: 'normal'
  },
  // See #13
  textMultiLine: {
    display: '-webkit-box',
    maxWidth: '100%',
    overflow: 'clip',
    textOverflow: 'ellipsis',
    WebkitBoxOrient: 'vertical'
  },
  notSelectable: {
    userSelect: 'none'
  },
  selectable: {
    userSelect: 'text'
  },
  pressable: {
    cursor: 'pointer'
  }
});

export default Text;
