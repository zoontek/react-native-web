/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import getBoundingClientRect from '../../modules/getBoundingClientRect';
import setValueForStyles from '../../modules/setValueForStyles';
import type {
  LayoutCallback,
  MeasureInWindowCallback,
  Nullable
} from '../../types';

const getRect = (node: HTMLElement) => {
  const height = node.offsetHeight;
  const width = node.offsetWidth;
  let left = node.offsetLeft;
  let top = node.offsetTop;
  node = node.offsetParent as HTMLElement;

  while (node && node.nodeType === 1 /* Node.ELEMENT_NODE */) {
    left += node.offsetLeft + node.clientLeft - node.scrollLeft;
    top += node.offsetTop + node.clientTop - node.scrollTop;
    node = node.offsetParent as HTMLElement;
  }

  top -= window.scrollY;
  left -= window.scrollX;

  return { width, height, top, left };
};

const measureLayout = (
  node: HTMLElement,
  relativeToNativeNode: Nullable<HTMLElement>,
  callback: LayoutCallback
) => {
  const relativeNode =
    relativeToNativeNode ||
    (node && (node.parentNode as Nullable<HTMLElement>));
  if (node && relativeNode) {
    setTimeout(() => {
      if (node.isConnected && relativeNode.isConnected) {
        const relativeRect = getRect(relativeNode);
        const { height, left, top, width } = getRect(node);
        const x = left - relativeRect.left;
        const y = top - relativeRect.top;
        callback(x, y, width, height, left, top);
      }
    }, 0);
  }
};

const elementsToIgnore: Record<string, boolean> = {
  A: true,
  BODY: true,
  INPUT: true,
  SELECT: true,
  TEXTAREA: true
};

const UIManager = {
  blur(node: HTMLElement) {
    try {
      node.blur();
    } catch {}
  },

  focus(node: HTMLElement) {
    try {
      const name = node.nodeName;
      // A tabIndex of -1 allows element to be programmatically focused but
      // prevents keyboard focus. We don't want to set the tabindex value on
      // elements that should not prevent keyboard focus.
      if (
        node.getAttribute('tabIndex') == null &&
        node.isContentEditable !== true &&
        elementsToIgnore[name] == null
      ) {
        node.setAttribute('tabIndex', '-1');
      }
      node.focus();
    } catch {}
  },

  measure(node: HTMLElement, callback: LayoutCallback) {
    measureLayout(node, null, callback);
  },

  measureInWindow(node: HTMLElement, callback: MeasureInWindowCallback) {
    if (node) {
      setTimeout(() => {
        const { height, left, top, width } = getBoundingClientRect(
          node
        ) as DOMRect;
        callback(left, top, width, height);
      }, 0);
    }
  },

  measureLayout(
    node: HTMLElement,
    relativeToNativeNode: Nullable<HTMLElement>,
    onFail: () => void,
    onSuccess: LayoutCallback
  ) {
    measureLayout(node, relativeToNativeNode, onSuccess);
  },

  updateView(node: HTMLElement, props: Record<string, unknown>) {
    for (const prop in props) {
      if (!Object.prototype.hasOwnProperty.call(props, prop)) {
        continue;
      }

      const value = props[prop];
      switch (prop) {
        case 'style': {
          setValueForStyles(node, value as Record<string, unknown>);
          break;
        }
        case 'class':
        case 'className': {
          node.setAttribute('class', value as string);
          break;
        }
        case 'text':
        case 'value':
          // native platforms use `text` prop to replace text input value
          (node as HTMLInputElement).value = value as string;
          break;
        default:
          node.setAttribute(prop, value as string);
      }
    }
  },

  configureNextLayoutAnimation(config: unknown, onAnimationDidEnd: () => void) {
    onAnimationDidEnd();
  },

  // mocks
  setLayoutAnimationEnabledExperimental() {}
};

export default UIManager;
