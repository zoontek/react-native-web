/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import type * as RN from 'react-native';

import canUseDOM from '../../modules/canUseDom';
import type { Except } from '../../types';

type ChangeHandler = (enabled: boolean) => void;

const createMedia = (query: string) => {
  if (!canUseDOM || typeof window.matchMedia !== 'function') {
    return {
      get matches() {
        return false;
      },
      addChangeHandler() {
        return { remove() {} };
      }
    };
  }

  // Wrap each handler in an object so the same function can be registered twice
  const handlers = new Set<{ handler: ChangeHandler }>();
  const media = window.matchMedia(query);

  const listener = (event: MediaQueryListEvent) =>
    handlers.forEach(({ handler }) => handler(event.matches));

  return {
    get matches() {
      return media.matches;
    },
    addChangeHandler(handler: ChangeHandler) {
      const entry = { handler };

      if (handlers.size === 0) {
        media.addEventListener('change', listener);
      }

      handlers.add(entry);

      return {
        remove() {
          if (handlers.delete(entry) && handlers.size === 0) {
            media.removeEventListener('change', listener);
          }
        }
      };
    }
  };
};

const prefersContrastMedia = createMedia('(prefers-contrast: more)');

const prefersReducedMotionMedia = createMedia(
  '(prefers-reduced-motion: reduce)'
);
const prefersReducedTransparencyMedia = createMedia(
  '(prefers-reduced-transparency: reduce)'
);

export type AccessibilityInfoStatic = Except<
  typeof RN.AccessibilityInfo,
  'setAccessibilityFocus'
> & {
  /**
   * Set accessibility focus to a React component.
   *
   * @deprecated Use `sendAccessibilityEvent` with eventType `focus` instead.
   */
  setAccessibilityFocus: (reactTag: HTMLElement) => void;
};

export type AccessibilityHandle = Parameters<
  AccessibilityInfoStatic['sendAccessibilityEvent']
>[0];

export type AccessibilityEventType = Parameters<
  AccessibilityInfoStatic['sendAccessibilityEvent']
>[1];

const AccessibilityInfo: AccessibilityInfoStatic = {
  announceForAccessibility: () => {},
  announceForAccessibilityWithOptions: () => {},

  setAccessibilityFocus: (reactTag) => {
    if (typeof reactTag?.focus === 'function') {
      reactTag.focus();
    }
  },

  sendAccessibilityEvent: (handle, eventType) => {
    if (eventType === 'focus') {
      handle.focus();
    }
  },

  getRecommendedTimeoutMillis: (originalTimeout) =>
    Promise.resolve(originalTimeout),

  isAccessibilityServiceEnabled: () => Promise.resolve(true),
  isScreenReaderEnabled: () => Promise.resolve(true),

  isBoldTextEnabled: () => Promise.resolve(false),
  isDarkerSystemColorsEnabled: () => Promise.resolve(false),
  isGrayscaleEnabled: () => Promise.resolve(false),
  isInvertColorsEnabled: () => Promise.resolve(false),
  prefersCrossFadeTransitions: () => Promise.resolve(false),

  isHighTextContrastEnabled: () =>
    Promise.resolve(prefersContrastMedia.matches),
  isReduceMotionEnabled: () =>
    Promise.resolve(prefersReducedMotionMedia.matches),
  isReduceTransparencyEnabled: () =>
    Promise.resolve(prefersReducedTransparencyMedia.matches),

  addEventListener: (eventName, handler) => {
    const casted = handler as ChangeHandler;

    if (eventName === 'highTextContrastChanged') {
      return prefersContrastMedia.addChangeHandler(casted);
    } else if (eventName === 'reduceMotionChanged') {
      return prefersReducedMotionMedia.addChangeHandler(casted);
    } else if (eventName === 'reduceTransparencyChanged') {
      return prefersReducedTransparencyMedia.addChangeHandler(casted);
    }

    return { remove() {} };
  }
};

export default AccessibilityInfo;
