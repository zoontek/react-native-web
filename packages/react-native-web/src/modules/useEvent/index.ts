/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Nullable } from '../../types';
import { addEventListener } from '../addEventListener';
import useLayoutEffect from '../useLayoutEffect';
import useStable from '../useStable';

type Callback = null | ((e: Event) => void);

type AddListener = (
  target: EventTarget,
  listener: null | ((e: Event) => void)
) => () => void;

/**
 * This can be used with any event type include custom events.
 *
 * const click = useEvent('click', options);
 * useEffect(() => {
 *   click.setListener(target, onClick);
 *   return () => click.clear();
 * }).
 */
export default function useEvent(
  eventType: string,
  options?: Nullable<{ capture?: boolean; passive?: boolean; once?: boolean }>
): AddListener {
  const targetListeners = useStable(() => new Map<EventTarget, () => void>());

  const addListener = useStable(() => {
    return (target: EventTarget, callback: Callback) => {
      const removeTargetListener = targetListeners.get(target);
      if (removeTargetListener != null) {
        removeTargetListener();
      }
      if (callback == null) {
        targetListeners.delete(target);
        callback = () => {};
      }
      const removeEventListener = addEventListener(
        target,
        eventType,
        callback,
        options
      );
      targetListeners.set(target, removeEventListener);
      return removeEventListener;
    };
  });

  useLayoutEffect(() => {
    return () => {
      targetListeners.forEach((removeListener) => {
        removeListener();
      });
      targetListeners.clear();
    };
  }, [targetListeners]);

  return addListener;
}
