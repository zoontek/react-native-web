/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { RefObject } from 'react';

import type { Nullable } from '../../types';
import useEvent from '../useEvent';
import useLayoutEffect from '../useLayoutEffect';

/**
 * Types
 */

export type HoverEventsConfig = {
  contain?: Nullable<boolean>;
  disabled?: Nullable<boolean>;
  onHoverStart?: Nullable<(e: Event) => void>;
  onHoverChange?: Nullable<(bool: boolean) => void>;
  onHoverUpdate?: Nullable<(e: Event) => void>;
  onHoverEnd?: Nullable<(e: Event) => void>;
};

type HoverEvent = Event & {
  x?: number;
  y?: number;
  clientX?: number;
  clientY?: number;
  pointerType?: string;
};

type CustomEventPayload = {
  bubbles?: boolean;
  cancelable?: boolean;
  detail?: Record<string, unknown>;
};

/**
 * Implementation
 */

const emptyObject: CustomEventPayload = {};
const opts = { passive: true };
const lockEventType = 'react-gui:hover:lock';
const unlockEventType = 'react-gui:hover:unlock';

function dispatchCustomEvent(
  target: EventTarget,
  type: string,
  payload?: CustomEventPayload
) {
  const { bubbles = true, cancelable = true, detail } = payload || emptyObject;
  const event = new CustomEvent(type, { bubbles, cancelable, detail });
  target.dispatchEvent(event);
}

export default function useHover(
  targetRef: RefObject<HTMLElement | null>,
  config: HoverEventsConfig
): void {
  const {
    contain,
    disabled,
    onHoverStart,
    onHoverChange,
    onHoverUpdate,
    onHoverEnd
  } = config;

  const addMoveListener = useEvent('pointermove', opts);
  const addEnterListener = useEvent('pointerenter', opts);
  const addLeaveListener = useEvent('pointerleave', opts);
  // These custom events are used to implement the "contain" prop.
  const addLockListener = useEvent(lockEventType, opts);
  const addUnlockListener = useEvent(unlockEventType, opts);

  useLayoutEffect(() => {
    const target = targetRef.current;
    if (target !== null) {
      /**
       * End the hover gesture
       */
      const hoverEnd = function (e: HoverEvent) {
        if (onHoverEnd != null) {
          onHoverEnd(e);
        }
        if (onHoverChange != null) {
          onHoverChange(false);
        }
        // Remove the listeners once finished.
        addMoveListener(target, null);
        addLeaveListener(target, null);
      };

      /**
       * Leave element
       */
      const leaveListener = function (e: HoverEvent) {
        const target = targetRef.current;
        if (target != null && e.pointerType !== 'touch') {
          if (contain) {
            dispatchCustomEvent(target, unlockEventType);
          }
          hoverEnd(e);
        }
      };

      /**
       * Move within element
       */
      const moveListener = function (e: HoverEvent) {
        if (e.pointerType !== 'touch') {
          if (onHoverUpdate != null) {
            // Not all browsers have these properties
            if (e.x == null) {
              e.x = e.clientX;
            }
            if (e.y == null) {
              e.y = e.clientY;
            }
            onHoverUpdate(e);
          }
        }
      };

      /**
       * Start the hover gesture
       */
      const hoverStart = function (e: HoverEvent) {
        if (onHoverStart != null) {
          onHoverStart(e);
        }
        if (onHoverChange != null) {
          onHoverChange(true);
        }
        // Set the listeners needed for the rest of the hover gesture.
        if (onHoverUpdate != null) {
          addMoveListener(target, !disabled ? moveListener : null);
        }
        addLeaveListener(target, !disabled ? leaveListener : null);
      };

      /**
       * Enter element
       */
      const enterListener = function (e: HoverEvent) {
        const target = targetRef.current;
        if (target != null && e.pointerType !== 'touch') {
          if (contain) {
            dispatchCustomEvent(target, lockEventType);
          }
          hoverStart(e);
          const lockListener = function (lockEvent: Event) {
            if (lockEvent.target !== target) {
              hoverEnd(e);
            }
          };
          const unlockListener = function (lockEvent: Event) {
            if (lockEvent.target !== target) {
              hoverStart(e);
            }
          };
          addLockListener(target, !disabled ? lockListener : null);
          addUnlockListener(target, !disabled ? unlockListener : null);
        }
      };

      addEnterListener(target, !disabled ? enterListener : null);
    }
  }, [
    addEnterListener,
    addMoveListener,
    addLeaveListener,
    addLockListener,
    addUnlockListener,
    contain,
    disabled,
    onHoverStart,
    onHoverChange,
    onHoverUpdate,
    onHoverEnd,
    targetRef
  ]);
}
