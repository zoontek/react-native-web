/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

import invariant from 'fbjs/lib/invariant';
import Platform from '../../../exports/Platform';
import type { Nullable } from '../../../types';
import type {
  EventSubscription,
  IEventEmitter
} from '../vendor/emitter/EventEmitter';
import RCTDeviceEventEmitter from './RCTDeviceEventEmitter';

type NativeModule = Readonly<{
  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;
}>;

export type { EventSubscription };

/**
 * `NativeEventEmitter` is intended for use by Native Modules to emit events to
 * JavaScript listeners. If a `NativeModule` is supplied to the constructor, it
 * will be notified (via `addListener` and `removeListeners`) when the listener
 * count changes to manage "native memory".
 *
 * Currently, all native events are fired via a global `RCTDeviceEventEmitter`.
 * This means event names must be globally unique, and it means that call sites
 * can theoretically listen to `RCTDeviceEventEmitter` (although discouraged).
 */
export default class NativeEventEmitter<
  TEventToArgsMap extends Record<string, unknown[]>
> implements IEventEmitter<TEventToArgsMap>
{
  _nativeModule: Nullable<NativeModule>;

  constructor(nativeModule: Nullable<NativeModule>) {
    if (Platform.OS === 'ios') {
      invariant(
        nativeModule != null,
        '`new NativeEventEmitter()` requires a non-null argument.'
      );
      this._nativeModule = nativeModule;
    }
  }

  addListener<TEvent extends keyof TEventToArgsMap & string>(
    eventType: TEvent,
    listener: (...args: TEventToArgsMap[TEvent]) => unknown,
    context?: unknown
  ): EventSubscription {
    this._nativeModule?.addListener(eventType);
    let subscription: Nullable<EventSubscription> =
      RCTDeviceEventEmitter.addListener(
        eventType,
        listener as (...args: unknown[]) => unknown,
        context
      );

    return {
      remove: () => {
        if (subscription != null) {
          this._nativeModule?.removeListeners(1);
          subscription.remove();
          subscription = null;
        }
      }
    };
  }

  /**
   * @deprecated Use `remove` on the EventSubscription from `addListener`.
   */
  removeListener<TEvent extends keyof TEventToArgsMap & string>(
    eventType: TEvent,
    listener: (...args: TEventToArgsMap[TEvent]) => unknown
  ): void {
    this._nativeModule?.removeListeners(1);
    // NOTE: This will report a deprecation notice via `console.error`.
    // `removeListener` exists but is deprecated.
    const emitter = RCTDeviceEventEmitter as unknown as {
      removeListener: (
        eventType: TEvent,
        listener: (...args: TEventToArgsMap[TEvent]) => unknown
      ) => void;
    };
    emitter.removeListener(eventType, listener);
  }

  emit<TEvent extends keyof TEventToArgsMap & string>(
    eventType: TEvent,
    ...args: TEventToArgsMap[TEvent]
  ): void {
    // Generally, `RCTDeviceEventEmitter` is directly invoked. But this is
    // included for completeness.
    RCTDeviceEventEmitter.emit(eventType, ...args);
  }

  removeAllListeners<TEvent extends keyof TEventToArgsMap & string>(
    eventType?: Nullable<TEvent>
  ): void {
    invariant(
      eventType != null,
      '`NativeEventEmitter.removeAllListener()` requires a non-null argument.'
    );
    this._nativeModule?.removeListeners(
      this.listenerCount(eventType as TEvent)
    );
    RCTDeviceEventEmitter.removeAllListeners(eventType);
  }

  listenerCount<TEvent extends keyof TEventToArgsMap & string>(
    eventType: TEvent
  ): number {
    return RCTDeviceEventEmitter.listenerCount(eventType);
  }
}
