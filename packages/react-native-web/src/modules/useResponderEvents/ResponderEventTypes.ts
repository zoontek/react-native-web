/**
 * Copyright (c) Nicolas Gallagher
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type Touch = {
  force: number;
  identifier: number;
  // The locationX and locationY properties are non-standard additions
  locationX: number | undefined;
  locationY: number | undefined;
  pageX: number;
  pageY: number;
  target: EventTarget | null;
  // Touches in a list have a timestamp property
  timestamp: number;
};

export type TouchEvent = {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  // TouchList is an array in the Responder system
  changedTouches: Array<Touch>;
  force: number;
  // React Native adds properties to the "nativeEvent that are usually only found on W3C Touches ‾\_(ツ)_/‾
  identifier: number;
  locationX: number | undefined;
  locationY: number | undefined;
  pageX: number;
  pageY: number;
  target: EventTarget | null;
  // The timestamp has a lowercase "s" in the Responder system
  timestamp: number;
  // TouchList is an array in the Responder system
  touches: Array<Touch>;
  type: string;
};

export type ResponderDOMEvent = {
  altKey?: boolean;
  button?: number;
  buttons?: number;
  changedTouches?: TouchList;
  clientX?: number;
  clientY?: number;
  composedPath?: () => Array<EventTarget>;
  ctrlKey?: boolean;
  defaultPrevented: boolean;
  eventPhase?: number;
  isTrusted?: boolean;
  metaKey?: boolean;
  pageX: number;
  pageY: number;
  preventDefault?: () => void;
  relatedTarget?: EventTarget | null;
  shiftKey?: boolean;
  target: EventTarget | null;
  timeStamp: number;
  touches?: TouchList;
  type: string;
};

export const MOUSE_DOWN = 'mousedown';
export const MOUSE_MOVE = 'mousemove';
export const MOUSE_UP = 'mouseup';
export const MOUSE_CANCEL = 'dragstart';
export const TOUCH_START = 'touchstart';
export const TOUCH_MOVE = 'touchmove';
export const TOUCH_END = 'touchend';
export const TOUCH_CANCEL = 'touchcancel';
export const SCROLL = 'scroll';
export const SELECT = 'select';
export const SELECTION_CHANGE = 'selectionchange';

export function isStartish(eventType: unknown): boolean {
  return eventType === TOUCH_START || eventType === MOUSE_DOWN;
}

export function isMoveish(eventType: unknown): boolean {
  return eventType === TOUCH_MOVE || eventType === MOUSE_MOVE;
}

export function isEndish(eventType: unknown): boolean {
  return (
    eventType === TOUCH_END || eventType === MOUSE_UP || isCancelish(eventType)
  );
}

export function isCancelish(eventType: unknown): boolean {
  return eventType === TOUCH_CANCEL || eventType === MOUSE_CANCEL;
}

export function isScroll(eventType: unknown): boolean {
  return eventType === SCROLL;
}

export function isSelectionChange(eventType: unknown): boolean {
  return eventType === SELECT || eventType === SELECTION_CHANGE;
}
