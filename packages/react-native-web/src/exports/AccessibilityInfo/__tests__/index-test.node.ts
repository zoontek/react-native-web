/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import AccessibilityInfo from '..';

describe('apis/AccessibilityInfo', () => {
  test('resolves every media query backed value to false without a DOM', async () => {
    expect(await AccessibilityInfo.isHighTextContrastEnabled()).toBe(false);
    expect(await AccessibilityInfo.isReduceMotionEnabled()).toBe(false);
    expect(await AccessibilityInfo.isReduceTransparencyEnabled()).toBe(false);
  });

  test('returns an inert subscription from addEventListener', () => {
    const { remove } = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      vi.fn()
    );

    expect(remove).not.toThrow();
  });
});
