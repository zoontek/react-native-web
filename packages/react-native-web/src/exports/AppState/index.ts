/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import invariant from 'fbjs/lib/invariant';
import EventEmitter, {
  type EventSubscription
} from '../../vendor/react-native/vendor/emitter/EventEmitter';
import canUseDOM from '../../modules/canUseDom';
import type { Nullable } from '../../types';

type AppStateEvent = 'change' | 'memoryWarning';
type AppStateStatus = 'active' | 'background';

type AppStateEventToArgsMap = {
  change: [AppStateStatus];
};

const EVENT_TYPES = ['change', 'memoryWarning'];

const AppStates = {
  BACKGROUND: 'background',
  ACTIVE: 'active'
} satisfies Record<string, AppStateStatus>;

let changeEmitter: Nullable<EventEmitter<AppStateEventToArgsMap>> = null;

export default class AppState {
  static isAvailable = canUseDOM && !!document.visibilityState;

  static get currentState(): AppStateStatus {
    return !AppState.isAvailable || document.visibilityState === 'visible'
      ? AppStates.ACTIVE
      : AppStates.BACKGROUND;
  }

  static addEventListener(
    type: AppStateEvent,
    handler: (state: AppStateStatus) => void
  ): EventSubscription {
    if (!AppState.isAvailable) {
      return { remove: () => {} };
    }

    invariant(
      EVENT_TYPES.indexOf(type) !== -1,
      'Trying to subscribe to unknown event: "%s"',
      type
    );

    if (type !== 'change') {
      return { remove: () => {} };
    }

    if (!changeEmitter) {
      changeEmitter = new EventEmitter();

      document.addEventListener(
        'visibilitychange',
        () => {
          if (changeEmitter) {
            changeEmitter.emit('change', AppState.currentState);
          }
        },
        false
      );
    }

    return changeEmitter.addListener(type, handler);
  }
}
