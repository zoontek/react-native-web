/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { RefObject } from 'react';

import UIManager from '../../exports/UIManager';
import type { LayoutEvent, Nullable } from '../../types';
import canUseDOM from '../canUseDom';
import useLayoutEffect from '../useLayoutEffect';

const DOM_LAYOUT_HANDLER_NAME = '__reactLayoutHandler';

type LayoutHandlerNode = HTMLElement & {
  [DOM_LAYOUT_HANDLER_NAME]?: Nullable<(e: LayoutEvent) => void>;
};

let resizeObserver: Nullable<ResizeObserver> = null;

function getResizeObserver(): Nullable<ResizeObserver> {
  if (
    canUseDOM &&
    typeof window.ResizeObserver === 'function' &&
    resizeObserver == null
  ) {
    resizeObserver = new window.ResizeObserver(function (entries) {
      entries.forEach((entry) => {
        const node = entry.target as LayoutHandlerNode;
        const onLayout = node[DOM_LAYOUT_HANDLER_NAME];
        if (typeof onLayout === 'function') {
          // We still need to measure the view because browsers don't yet provide
          // border-box dimensions in the entry
          UIManager.measure(node, (x, y, width, height, left, top) => {
            const layout = { x, y, width, height, left, top };
            const event: LayoutEvent = {
              nativeEvent: {
                layout,
                get target() {
                  return entry.target;
                }
              },
              timeStamp: Date.now()
            };
            onLayout(event);
          });
        }
      });
    });
  }
  return resizeObserver;
}

export default function useElementLayout(
  ref: RefObject<Nullable<LayoutHandlerNode>>,
  onLayout?: Nullable<(e: LayoutEvent) => void>
) {
  const observer = getResizeObserver();

  useLayoutEffect(() => {
    const node = ref.current;
    if (node != null) {
      node[DOM_LAYOUT_HANDLER_NAME] = onLayout;
    }
  }, [ref, onLayout]);

  // Observing is done in a separate effect to avoid this effect running
  // when 'onLayout' changes.
  useLayoutEffect(() => {
    const node = ref.current;
    if (node != null && observer != null) {
      if (typeof node[DOM_LAYOUT_HANDLER_NAME] === 'function') {
        observer.observe(node);
      } else {
        observer.unobserve(node);
      }
    }
    return () => {
      if (node != null && observer != null) {
        observer.unobserve(node);
      }
    };
  }, [ref, observer]);
}
