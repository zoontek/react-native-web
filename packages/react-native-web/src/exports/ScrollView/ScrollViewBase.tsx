/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { forwardRef, useRef, type UIEvent } from 'react';

import useMergeRefs from '../../modules/useMergeRefs';
import type { Nullable, PlatformMethods } from '../../types';
import StyleSheet from '../StyleSheet';
import View, { type ViewProps } from '../View';

type Props = Omit<ViewProps, 'onScroll'> & {
  onMomentumScrollBegin?: (e: unknown) => void;
  onMomentumScrollEnd?: (e: unknown) => void;
  onScroll?: (e: unknown) => void;
  onScrollBeginDrag?: (e: unknown) => void;
  onScrollEndDrag?: (e: unknown) => void;
  onTouchMove?: ViewProps['onTouchMove'];
  onWheel?: ViewProps['onWheel'];
  scrollEnabled?: boolean;
  scrollEventThrottle?: number;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
};

function normalizeScrollEvent(e: UIEvent<HTMLElement>) {
  const target = e.target as HTMLElement;
  return {
    nativeEvent: {
      contentOffset: {
        get x() {
          return target.scrollLeft;
        },
        get y() {
          return target.scrollTop;
        }
      },
      contentSize: {
        get height() {
          return target.scrollHeight;
        },
        get width() {
          return target.scrollWidth;
        }
      },
      layoutMeasurement: {
        get height() {
          return target.offsetHeight;
        },
        get width() {
          return target.offsetWidth;
        }
      }
    },
    timeStamp: Date.now()
  };
}

function shouldEmitScrollEvent(lastTick: number, eventThrottle: number) {
  const timeSinceLastTick = Date.now() - lastTick;
  return eventThrottle > 0 && timeSinceLastTick >= eventThrottle;
}

// TODO: remove the alias after forwardRef removal
type TNode = HTMLElement & PlatformMethods;

/**
 * Encapsulates the Web-specific scroll throttling and disabling logic
 */
const ScrollViewBase = forwardRef<TNode, Props>((props, forwardedRef) => {
  const {
    onScroll,
    onTouchMove,
    onWheel,
    scrollEnabled = true,
    scrollEventThrottle = 0,
    showsHorizontalScrollIndicator,
    showsVerticalScrollIndicator,
    style,
    ...rest
  } = props;

  const scrollState = useRef({ isScrolling: false, scrollLastTick: 0 });
  const scrollTimeout = useRef<Nullable<ReturnType<typeof setTimeout>>>(null);
  const scrollRef = useRef<TNode | null>(null);

  function createPreventableScrollHandler<T>(handler?: (e: T) => void) {
    return (e: T) => {
      if (scrollEnabled) {
        if (handler) {
          handler(e);
        }
      }
    };
  }

  function handleScroll(e: UIEvent<HTMLElement>) {
    e.stopPropagation();
    if (e.target === scrollRef.current) {
      e.persist();
      // A scroll happened, so the scroll resets the scrollend timeout.
      if (scrollTimeout.current != null) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        handleScrollEnd(e);
      }, 100);
      if (scrollState.current.isScrolling) {
        // Scroll last tick may have changed, check if we need to notify
        if (
          shouldEmitScrollEvent(
            scrollState.current.scrollLastTick,
            scrollEventThrottle
          )
        ) {
          handleScrollTick(e);
        }
      } else {
        // Weren't scrolling, so we must have just started
        handleScrollStart(e);
      }
    }
  }

  function handleScrollStart(e: UIEvent<HTMLElement>) {
    scrollState.current.isScrolling = true;
    handleScrollTick(e);
  }

  function handleScrollTick(e: UIEvent<HTMLElement>) {
    scrollState.current.scrollLastTick = Date.now();
    if (onScroll) {
      onScroll(normalizeScrollEvent(e));
    }
  }

  function handleScrollEnd(e: UIEvent<HTMLElement>) {
    scrollState.current.isScrolling = false;
    if (onScroll) {
      onScroll(normalizeScrollEvent(e));
    }
  }

  const hideScrollbar =
    showsHorizontalScrollIndicator === false ||
    showsVerticalScrollIndicator === false;

  return (
    <View
      {...rest}
      onScroll={handleScroll}
      onTouchMove={createPreventableScrollHandler(onTouchMove)}
      onWheel={createPreventableScrollHandler(onWheel)}
      ref={useMergeRefs(scrollRef, forwardedRef)}
      style={[
        style,
        !scrollEnabled && styles.scrollDisabled,
        hideScrollbar && styles.hideScrollbar
      ]}
    />
  );
});

// Chrome doesn't support e.preventDefault in this case; touch-action must be
// used to disable scrolling.
// https://developers.google.com/web/updates/2017/01/scrolling-intervention
const styles = StyleSheet.create({
  scrollDisabled: {
    overflowX: 'hidden',
    overflowY: 'hidden',
    touchAction: 'none'
  },
  hideScrollbar: {
    scrollbarWidth: 'none'
  }
});

export default ScrollViewBase;
