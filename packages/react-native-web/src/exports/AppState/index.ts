/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import invariant from 'fbjs/lib/invariant';
import type { AppStateEvent, AppStateStatus } from 'react-native';

import canUseDOM from '../../modules/canUseDom';
import strictArray from '../../modules/strictArray';
import type { Nullable } from '../../types';
import EventEmitter from '../../vendor/react-native/vendor/emitter/EventEmitter';

type AppStateClass = typeof import('react-native').AppState;
type AddEventListener = AppStateClass['addEventListener'];

type AppStateEventDefinitions = {
  change: [AppStateStatus];
  memoryWarning: [];
  blur: [];
  focus: [];
};

const EVENT_TYPES = strictArray<AppStateEvent>({
  change: null,
  memoryWarning: null,
  blur: null,
  focus: null
});

const AppStates: Record<Uppercase<AppStateStatus>, AppStateStatus> = {
  INACTIVE: 'inactive',
  BACKGROUND: 'background',
  ACTIVE: 'active',
  EXTENSION: 'extension',
  UNKNOWN: 'unknown'
};

let changeEmitter: Nullable<EventEmitter<AppStateEventDefinitions>> = null;

const AppState: AppStateClass = class Impl {
  static isAvailable = canUseDOM && !!document.visibilityState;

  static get currentState(): AppStateStatus {
    return !Impl.isAvailable || document.visibilityState === 'visible'
      ? AppStates.ACTIVE
      : AppStates.BACKGROUND;
  }

  static addEventListener: AddEventListener = (type, handler) => {
    if (!Impl.isAvailable) {
      return { remove: () => {} };
    }

    invariant(
      EVENT_TYPES.includes(type),
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
        () => changeEmitter?.emit('change', Impl.currentState),
        false
      );
    }

    return changeEmitter.addListener(type, handler);
  };
};

export default AppState;
