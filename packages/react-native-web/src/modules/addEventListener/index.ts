/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Nullable } from '../../types';

type NormalizedEvent = Event & {
  nativeEvent: Event;
  persist: () => void;
  isDefaultPrevented: () => boolean;
  isPropagationStopped: () => boolean;
};

type Listener = (e: NormalizedEvent) => void;

export type EventOptions = {
  capture?: boolean;
  passive?: boolean;
  once?: boolean;
};

const emptyFunction = () => {};

/**
 * Shim generic API compatibility with ReactDOM's synthetic events, without needing the
 * large amount of code ReactDOM uses to do this. Ideally we wouldn't use a synthetic
 * event wrapper at all.
 */
function isPropagationStopped(this: Event) {
  return this.cancelBubble;
}
function isDefaultPrevented(this: Event) {
  return this.defaultPrevented;
}
function normalizeEvent(event: Event): NormalizedEvent {
  const normalized = event as NormalizedEvent;
  normalized.nativeEvent = event;
  normalized.persist = emptyFunction;
  normalized.isDefaultPrevented = isDefaultPrevented;
  normalized.isPropagationStopped = isPropagationStopped;
  return normalized;
}

export function addEventListener(
  target: EventTarget,
  type: string,
  listener: Listener,
  options?: Nullable<EventOptions>
): () => void {
  const opts = options ?? false;
  const compatListener = (e: Event) => listener(normalizeEvent(e));
  target.addEventListener(type, compatListener, opts);

  return function removeEventListener() {
    if (target != null) {
      target.removeEventListener(type, compatListener, opts);
    }
  };
}
