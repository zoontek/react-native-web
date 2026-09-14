/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as RN from 'react-native';

import getBoundingClientRect from '../../modules/getBoundingClientRect';
import setValueForStyles from '../../modules/setValueForStyles';
import type { Except, Nullable } from '../../types';

const noop = () => {};

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
  callback: RN.MeasureOnSuccessCallback
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

const UIManager: Except<
  typeof RN.UIManager,
  | 'updateView'
  | 'measure'
  | 'measureInWindow'
  | 'measureLayout'
  | 'focus'
  | 'blur'
> & {
  readonly updateView: (
    node: HTMLElement,
    viewName: string,
    props: Record<string, unknown>
  ) => void;

  /**
   * Determines the location on screen, width, and height of the given view and
   * returns the values via an async callback. If successful, the callback will
   * be called with the following arguments:
   *
   *  - x
   *  - y
   *  - width
   *  - height
   *  - pageX
   *  - pageY
   *
   * Note that these measurements are not available until after the rendering
   * has been completed in native. If you need the measurements as soon as
   * possible, consider using the [`onLayout`
   * prop](docs/view.html#onlayout) instead.
   *
   * @deprecated Use `ref.measure` instead.
   */
  readonly measure: (
    node: HTMLElement,
    callback: RN.MeasureOnSuccessCallback
  ) => void;

  /**
   * Determines the location of the given view in the window and returns the
   * values via an async callback. If the React root view is embedded in
   * another native view, this will give you the absolute coordinates. If
   * successful, the callback will be called with the following
   * arguments:
   *
   *  - x
   *  - y
   *  - width
   *  - height
   *
   * Note that these measurements are not available until after the rendering
   * has been completed in native.
   *
   * @deprecated Use `ref.measureInWindow` instead.
   */
  readonly measureInWindow: (
    node: HTMLElement,
    callback: RN.MeasureInWindowOnSuccessCallback
  ) => void;

  /**
   * Like [`measure()`](#measure), but measures the view relative an ancestor,
   * specified as `relativeToNativeNode`. This means that the returned x, y
   * are relative to the origin x, y of the ancestor view.
   *
   * As always, to obtain a native node handle for a component, you can use
   * `React.findNodeHandle(component)`.
   *
   * @deprecated Use `ref.measureLayout` instead.
   */
  readonly measureLayout: (
    node: HTMLElement,
    ancestorNode: Nullable<HTMLElement>,
    errorCallback: () => void,
    callback: RN.MeasureLayoutOnSuccessCallback
  ) => void;

  readonly focus: (node: HTMLElement) => void;
  readonly blur: (node: HTMLElement) => void;
} = {
  updateView: (node, viewName, props) => {
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

  measure: (node, callback) => {
    measureLayout(node, null, callback);
  },

  measureInWindow: (node, callback) => {
    if (node) {
      setTimeout(() => {
        const rect = getBoundingClientRect(node) as DOMRect;
        callback(rect.left, rect.top, rect.width, rect.height);
      }, 0);
    }
  },

  measureLayout: (node, ancestorNode, errorCallback, callback) => {
    measureLayout(node, ancestorNode, callback);
  },

  configureNextLayoutAnimation: (config, callback) => {
    callback();
  },

  focus: (node) => {
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

  blur: (node) => {
    try {
      node.blur();
    } catch {}
  },

  // mocks
  getViewManagerConfig: () => ({}),
  hasViewManagerConfig: () => false,

  getConstants: () => ({}),
  createView: noop,
  findSubviewIn: noop,
  dispatchViewManagerCommand: noop,
  viewIsDescendantOf: noop,
  measureLayoutRelativeToParent: noop,
  setJSResponder: noop,
  clearJSResponder: noop,
  setChildren: noop,
  manageChildren: noop
};

export default UIManager;
