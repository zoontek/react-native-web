/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import canUseDOM from '../../modules/canUseDom';

type ChangeHandler = (isEnabled: boolean) => void;
type DOMChangeListener = (ev: MediaQueryListEvent) => void;

function isScreenReaderEnabled(): Promise<boolean> {
  return Promise.resolve(true);
}

const prefersReducedMotionMedia =
  canUseDOM && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

const handlers = new Map<ChangeHandler, DOMChangeListener>();

const AccessibilityInfo = {
  /**
   * Query whether a screen reader is currently enabled.
   *
   * Returns a promise which resolves to a boolean.
   * The result is `true` when a screen reader is enabled and `false` otherwise.
   */
  isScreenReaderEnabled,

  /**
   * Query whether the user prefers reduced motion.
   *
   * Returns a promise which resolves to a boolean.
   * The result is `true` when a screen reader is enabled and `false` otherwise.
   */
  isReduceMotionEnabled(): Promise<boolean> {
    return Promise.resolve(
      prefersReducedMotionMedia ? prefersReducedMotionMedia.matches : true
    );
  },

  /**
   * Deprecated
   */
  fetch: isScreenReaderEnabled,

  /**
   * Add an event handler. Supported events: reduceMotionChanged
   */
  addEventListener: function (
    eventName: string,
    handler: ChangeHandler
  ): { remove: () => void } | undefined {
    if (eventName === 'reduceMotionChanged') {
      if (!prefersReducedMotionMedia) {
        return;
      }
      const listener = (event: MediaQueryListEvent) => {
        handler(event.matches);
      };
      prefersReducedMotionMedia.addEventListener('change', listener);
      handlers.set(handler, listener);
    }

    return {
      remove: () => AccessibilityInfo.removeEventListener(eventName, handler)
    };
  },

  /**
   * Set accessibility focus to a react component.
   */
  setAccessibilityFocus: function (reactTag: number): void {},

  /**
   * Post a string to be announced by the screen reader.
   */
  announceForAccessibility: function (announcement: string): void {},

  /**
   * Remove an event handler.
   */
  removeEventListener: function (
    eventName: string,
    handler: ChangeHandler
  ): void {
    if (eventName === 'reduceMotionChanged') {
      const listener = handlers.get(handler);
      if (!listener || !prefersReducedMotionMedia) {
        return;
      }
      prefersReducedMotionMedia.removeEventListener('change', listener);
    }
    return;
  }
};

export default AccessibilityInfo;
