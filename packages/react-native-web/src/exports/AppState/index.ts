/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import invariant from 'fbjs/lib/invariant';
import type * as RN from 'react-native';

import canUseDOM from '../../modules/canUseDom';
import strictArray from '../../modules/strictArray';
import type { Nullable } from '../../types';
import EventEmitter from '../../vendor/react-native/vendor/emitter/EventEmitter';

type AppStateEventDefinitions = {
  change: [RN.AppStateStatus];
  memoryWarning: [];
  blur: [];
  focus: [];
};

const EVENT_TYPES = strictArray<RN.AppStateEvent>({
  change: null,
  memoryWarning: null,
  blur: null,
  focus: null
});

const AppStates: Record<Uppercase<RN.AppStateStatus>, RN.AppStateStatus> = {
  INACTIVE: 'inactive',
  BACKGROUND: 'background',
  ACTIVE: 'active',
  EXTENSION: 'extension',
  UNKNOWN: 'unknown'
};

const available = canUseDOM && !!document.visibilityState;
let changeEmitter: Nullable<EventEmitter<AppStateEventDefinitions>> = null;

const getCurrentState = (): RN.AppStateStatus =>
  !available || document.visibilityState === 'visible'
    ? AppStates.ACTIVE
    : AppStates.BACKGROUND;

const AppState: typeof RN.AppState = class {
  static isAvailable = available;

  static get currentState() {
    return getCurrentState();
  }

  static addEventListener = (type, handler) => {
    if (!available) {
      return { remove() {} };
    }

    invariant(
      EVENT_TYPES.includes(type),
      'Trying to subscribe to unknown event: "%s"',
      type
    );

    if (type !== 'change') {
      return { remove() {} };
    }

    if (!changeEmitter) {
      changeEmitter = new EventEmitter();

      document.addEventListener(
        'visibilitychange',
        () => {
          changeEmitter?.emit('change', getCurrentState());
        },
        false
      );
    }

    return changeEmitter.addListener(type, handler);
  };
};

export default AppState;
