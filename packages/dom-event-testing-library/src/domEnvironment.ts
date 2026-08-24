/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Change environment support for PointerEvent.
 */

export type Platform = 'mac' | 'windows';

function noop() {}

export function hasPointerEvent() {
  return global != null && global.PointerEvent != null;
}

export function setPointerEvent(bool: boolean) {
  const pointerCaptureFn = (name: string) => (id: unknown) => {
    if (typeof id !== 'number') {
      if (process.env.NODE_ENV !== 'production') {
        console.error('A pointerId must be passed to "%s"', name);
      }
    }
  };
  // The DOM lib types these as always defined, so assigning 'undefined' to
  // them does not typecheck. 'Reflect.set' writes them without a type cast.
  Reflect.set(global, 'PointerEvent', bool ? noop : undefined);
  Reflect.set(
    global.HTMLElement.prototype,
    'setPointerCapture',
    bool ? pointerCaptureFn('setPointerCapture') : undefined
  );
  Reflect.set(
    global.HTMLElement.prototype,
    'releasePointerCapture',
    bool ? pointerCaptureFn('releasePointerCapture') : undefined
  );
}

/**
 * Change environment host platform.
 */

const platformGetter = vi.spyOn(global.navigator, 'platform', 'get');

export const platform = {
  clear() {
    platformGetter.mockClear();
  },
  get(): Platform {
    return global.navigator.platform === 'MacIntel' ? 'mac' : 'windows';
  },
  set(name: Platform) {
    switch (name) {
      case 'mac': {
        platformGetter.mockReturnValue('MacIntel');
        break;
      }
      case 'windows': {
        platformGetter.mockReturnValue('Win32');
        break;
      }
      default: {
        break;
      }
    }
  }
};
