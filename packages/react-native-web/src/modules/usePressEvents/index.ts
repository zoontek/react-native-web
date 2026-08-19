/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import { useDebugValue, useEffect, useRef, type RefObject } from 'react';

import type { Nullable } from '../../types';
import PressResponder, {
  type EventHandlers,
  type PressResponderConfig
} from './PressResponder';

export default function usePressEvents(
  hostRef: RefObject<Nullable<HTMLElement>>,
  config: PressResponderConfig
): EventHandlers {
  const pressResponderRef = useRef<Nullable<PressResponder>>(null);
  if (pressResponderRef.current == null) {
    pressResponderRef.current = new PressResponder(config);
  }
  const pressResponder = pressResponderRef.current;

  // Re-configure to use the current node and configuration.
  useEffect(() => {
    pressResponder.configure(config);
  }, [config, pressResponder]);

  // Reset the `pressResponder` when cleanup needs to occur. This is
  // a separate effect because we do not want to rest the responder when `config` changes.
  useEffect(() => {
    return () => {
      pressResponder.reset();
    };
  }, [pressResponder]);

  useDebugValue(config);

  return pressResponder.getEventHandlers();
}
