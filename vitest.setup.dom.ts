/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// JSDOM doesn't implement ResizeObserver
window.ResizeObserver = class {
  disconnect() {}
  observe() {}
  unobserve() {}
};

// JSDOM doesn't provide values for 'clientWidth' etc. 'configurable' allows
// the environment to be shared by several test files
Object.defineProperty(window.document.documentElement, 'clientHeight', {
  configurable: true,
  get: function (this: { _jsdomClientWidth?: number }) {
    return this._jsdomClientWidth || window.innerHeight;
  }
});

Object.defineProperty(window.document.documentElement, 'clientWidth', {
  configurable: true,
  get: function (this: { _jsdomClientWidth?: number }) {
    return this._jsdomClientWidth || window.innerWidth;
  }
});
