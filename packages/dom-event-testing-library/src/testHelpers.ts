/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { hasPointerEvent, setPointerEvent } from './domEnvironment';
import type { PointerType } from './domEvents';

export function describeWithPointerEvent(
  message: string,
  describeFn: (hasPointerEvents: boolean) => void
) {
  const pointerEvent = 'PointerEvent';
  const fallback = 'MouseEvent/TouchEvent';
  describe.each`
    value    | name
    ${true}  | ${pointerEvent}
    ${false} | ${fallback}
  `(`${message}: $name`, (entry: { value: boolean }) => {
    const hasPointerEvents = entry.value;
    setPointerEvent(hasPointerEvents);
    describeFn(hasPointerEvents);
  });
}

export function testWithPointerType(
  message: string,
  testFn: (pointerType: PointerType) => void
) {
  const table: PointerType[] = hasPointerEvent()
    ? ['mouse', 'touch', 'pen']
    : ['mouse', 'touch'];
  test.each(table)(`${message}: %s`, (pointerType) => {
    testFn(pointerType);
  });
}
