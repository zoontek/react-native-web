/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  AccessibilityEventType,
  AccessibilityHandle,
  AccessibilityInfoStatic
} from '..';

type ChangeListener = (event: MediaQueryListEvent) => void;

// [event name, getter name, media query]
const MEDIA = [
  [
    'highTextContrastChanged',
    'isHighTextContrastEnabled',
    '(prefers-contrast: more)'
  ],
  [
    'reduceMotionChanged',
    'isReduceMotionEnabled',
    '(prefers-reduced-motion: reduce)'
  ],
  [
    'reduceTransparencyChanged',
    'isReduceTransparencyEnabled',
    '(prefers-reduced-transparency: reduce)'
  ]
] as const;

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const createMediaQueryList = () => {
  const listeners = new Set<ChangeListener>();

  return {
    listeners,
    matches: false,

    addEventListener: vi.fn((type: string, listener: ChangeListener) => {
      if (type === 'change') {
        listeners.add(listener);
      }
    }),

    removeEventListener: vi.fn((type: string, listener: ChangeListener) => {
      if (type === 'change') {
        listeners.delete(listener);
      }
    })
  };
};

describe('apis/AccessibilityInfo', () => {
  let AccessibilityInfo: AccessibilityInfoStatic;
  let mediaQueryLists: Map<string, ReturnType<typeof createMediaQueryList>>;

  const getMediaQueryList = (query: string) => {
    const mediaQueryList = mediaQueryLists.get(query);

    if (mediaQueryList == null) {
      throw new Error(`window.matchMedia was not called with "${query}"`);
    }

    return mediaQueryList;
  };

  const emitChange = (query: string, matches: boolean) => {
    const mediaQueryList = getMediaQueryList(query);
    mediaQueryList.matches = matches;

    mediaQueryList.listeners.forEach((listener) => {
      listener({ matches } as MediaQueryListEvent);
    });
  };

  const createInput = () => {
    const element = document.createElement('input');
    document.body.appendChild(element);
    return element;
  };

  const sendAccessibilityEvent = (
    element: HTMLElement,
    eventType: AccessibilityEventType
  ) =>
    AccessibilityInfo.sendAccessibilityEvent(
      element as unknown as AccessibilityHandle,
      eventType
    );

  beforeEach(async () => {
    mediaQueryLists = new Map();

    vi.stubGlobal('matchMedia', (query: string) => {
      let mediaQueryList = mediaQueryLists.get(query);

      if (mediaQueryList == null) {
        mediaQueryList = createMediaQueryList();
        mediaQueryLists.set(query, mediaQueryList);
      }

      return mediaQueryList;
    });

    vi.resetModules();
    AccessibilityInfo = (await import('..')).default;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  test.each(MEDIA)(
    '"%s" and "%s" are backed by "%s"',
    async (eventName, getter, query) => {
      const handler = vi.fn();
      AccessibilityInfo.addEventListener(eventName, handler);

      await expect(AccessibilityInfo[getter]()).resolves.toBe(false);

      emitChange(query, true);
      expect(handler).toHaveBeenLastCalledWith(true);
      await expect(AccessibilityInfo[getter]()).resolves.toBe(true);

      emitChange(query, false);
      expect(handler).toHaveBeenLastCalledWith(false);
      await expect(AccessibilityInfo[getter]()).resolves.toBe(false);
    }
  );

  const CONSTANTS = [
    ['isAccessibilityServiceEnabled', true],
    ['isScreenReaderEnabled', true],
    ['isBoldTextEnabled', false],
    ['isDarkerSystemColorsEnabled', false],
    ['isGrayscaleEnabled', false],
    ['isInvertColorsEnabled', false],
    ['prefersCrossFadeTransitions', false]
  ] as const;

  test.each(CONSTANTS)('"%s" resolves to %s', async (getter, expected) => {
    expect(await AccessibilityInfo[getter]()).toBe(expected);
  });

  test('getRecommendedTimeoutMillis resolves the original timeout', async () => {
    expect(await AccessibilityInfo.getRecommendedTimeoutMillis(1)).toBe(1);
  });

  describe('addEventListener', () => {
    test('stops calling the handler once removed', () => {
      const handler = vi.fn();

      AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        handler
      ).remove();

      emitChange(MOTION_QUERY, true);
      expect(handler).toHaveBeenCalledTimes(0);
    });

    test('supports registering the same handler twice', () => {
      const handler = vi.fn();

      const listener = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        handler
      );

      AccessibilityInfo.addEventListener('reduceMotionChanged', handler);

      emitChange(MOTION_QUERY, true);
      expect(handler).toHaveBeenCalledTimes(2);

      listener.remove();

      emitChange(MOTION_QUERY, false);
      expect(handler).toHaveBeenCalledTimes(3);
    });

    test('subscribes to the media query once, and only unsubscribes at the end', () => {
      const mediaQueryList = getMediaQueryList(MOTION_QUERY);

      const first = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        vi.fn()
      );
      const second = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        vi.fn()
      );

      expect(mediaQueryList.addEventListener).toHaveBeenCalledTimes(1);

      first.remove();
      first.remove(); // a repeated remove must not drop the second handler
      expect(mediaQueryList.removeEventListener).toHaveBeenCalledTimes(0);

      second.remove();
      expect(mediaQueryList.removeEventListener).toHaveBeenCalledTimes(1);
      expect(mediaQueryList.listeners.size).toBe(0);
    });

    test('returns an inert subscription for unsupported events', () => {
      const handler = vi.fn();

      const { remove } = AccessibilityInfo.addEventListener(
        'announcementFinished',
        handler
      );

      expect(remove).not.toThrow();
      MEDIA.forEach(([, , query]) => emitChange(query, true));
      expect(handler).toHaveBeenCalledTimes(0);
    });
  });

  describe('setAccessibilityFocus', () => {
    test('focuses the element', () => {
      const element = createInput();
      AccessibilityInfo.setAccessibilityFocus(element);
      expect(document.activeElement).toBe(element);
    });

    test('ignores a React Native "reactTag" number', () => {
      expect(() =>
        // @ts-expect-error the React Native signature takes a number
        AccessibilityInfo.setAccessibilityFocus(1)
      ).not.toThrow();
    });
  });

  test('sendAccessibilityEvent only focuses for the "focus" event', () => {
    const focused = createInput();
    const ignored = createInput();

    sendAccessibilityEvent(focused, 'focus');
    expect(document.activeElement).toBe(focused);

    sendAccessibilityEvent(ignored, 'click');
    expect(document.activeElement).toBe(focused);
  });
});

describe('apis/AccessibilityInfo (no matchMedia support)', () => {
  let AccessibilityInfo: AccessibilityInfoStatic;

  beforeEach(async () => {
    expect(window.matchMedia).toBeUndefined();

    vi.resetModules();
    AccessibilityInfo = (await import('..')).default;
  });

  test.each(MEDIA)(
    '"%s" is inert and "%s" resolves to false',
    async (eventName, getter) => {
      const handler = vi.fn();
      const { remove } = AccessibilityInfo.addEventListener(eventName, handler);

      expect(await AccessibilityInfo[getter]()).toBe(false);
      expect(remove).not.toThrow();
      expect(handler).toHaveBeenCalledTimes(0);
    }
  );
});
