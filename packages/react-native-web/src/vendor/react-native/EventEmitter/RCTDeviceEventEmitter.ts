/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import EventEmitter from '../vendor/emitter/EventEmitter';
import type { IEventEmitter } from '../vendor/emitter/EventEmitter';

// FIXME: use typed events
type RCTDeviceEventDefinitions = Record<string, unknown[]>;

/**
 * Global EventEmitter used by the native platform to emit events to JavaScript.
 * Events are identified by globally unique event names.
 *
 * NativeModules that emit events should instead subclass `NativeEventEmitter`.
 */
const RCTDeviceEventEmitter: IEventEmitter<RCTDeviceEventDefinitions> =
  new EventEmitter<RCTDeviceEventDefinitions>();

export default RCTDeviceEventEmitter;
