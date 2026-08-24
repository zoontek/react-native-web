/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import invariant from 'fbjs/lib/invariant';
import type * as RN from 'react-native';

import canUseDOM from '../../modules/canUseDom';

export type DimensionsValue = {
  window: RN.DisplayMetrics;
  screen: RN.DisplayMetrics;
};

const dimensions: DimensionsValue = {
  window: {
    fontScale: 1,
    height: 0,
    scale: 1,
    width: 0
  },
  screen: {
    fontScale: 1,
    height: 0,
    scale: 1,
    width: 0
  }
};

const listeners: Partial<Record<'change', Set<Function>>> = {};

let shouldInit = canUseDOM;

function update() {
  if (!canUseDOM) {
    return;
  }

  const win = window;
  let height;
  let width;

  /**
   * iOS does not update viewport dimensions on keyboard open/close.
   * window.visualViewport(https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport)
   * is used instead of document.documentElement.clientHeight (which remains as a fallback)
   */
  if (win.visualViewport != null) {
    const visualViewport = win.visualViewport;
    /**
     * We are multiplying by scale because height and width from visual viewport
     * also react to pinch zoom, and become smaller when zoomed. But it is not desired
     * behaviour, since originally documentElement client height and width were used,
     * and they do not react to pinch zoom.
     */
    height = Math.round(visualViewport.height * visualViewport.scale);
    width = Math.round(visualViewport.width * visualViewport.scale);
  } else {
    const docEl = win.document.documentElement;
    height = docEl.clientHeight;
    width = docEl.clientWidth;
  }

  dimensions.window = {
    fontScale: 1,
    height,
    scale: win.devicePixelRatio || 1,
    width
  };

  dimensions.screen = {
    fontScale: 1,
    height: win.screen.height,
    scale: win.devicePixelRatio || 1,
    width: win.screen.width
  };
}

function handleResize() {
  update();
  listeners.change?.forEach((listener) => listener(dimensions));
}

const Dimensions: typeof RN.Dimensions = class {
  static get = (dim) => {
    if (shouldInit) {
      shouldInit = false;
      update();
    }

    invariant(
      dim === 'window' || dim === 'screen',
      `No dimension set for key ${dim}`
    );

    return dimensions[dim];
  };

  static set = (dims) => {
    invariant(!canUseDOM, 'Dimensions cannot be set in the browser');

    if (dims.screen != null) {
      dimensions.screen = dims.screen;
    }
    if (dims.window != null) {
      dimensions.window = dims.window;
    }
  };

  static addEventListener = (type, handler) => {
    listeners.change ??= new Set();
    listeners.change.add(handler);

    return {
      remove() {
        listeners.change?.delete(handler);
      }
    };
  };
};

if (canUseDOM) {
  if (window.visualViewport != null) {
    window.visualViewport.addEventListener('resize', handleResize, false);
  } else {
    window.addEventListener('resize', handleResize, false);
  }
}

export default Dimensions;
