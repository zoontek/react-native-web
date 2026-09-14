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

const isAvailable = canUseDOM && !!document.visibilityState;
let changeEmitter: Nullable<EventEmitter<AppStateEventDefinitions>> = null;

const getCurrentState = (): RN.AppStateStatus =>
  !isAvailable || document.visibilityState === 'visible'
    ? 'active'
    : 'background';

const AppState: typeof RN.AppState = class {
  static isAvailable = isAvailable;

  static get currentState() {
    return getCurrentState();
  }

  static addEventListener = (type, handler) => {
    if (!isAvailable) {
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
