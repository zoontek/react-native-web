/**
 * Copyright (c) Nicolas Gallagher
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Hook for integrating the Responder System into React
 *
 *   function SomeComponent({ onStartShouldSetResponder }) {
 *     const ref = useRef(null);
 *     useResponderEvents(ref, { onStartShouldSetResponder });
 *     return <div ref={ref} />
 *   }
 */

import { useDebugValue, useEffect, useRef, type RefObject } from 'react';

import type { Nullable } from '../../types';
import type { ResponderConfig } from './ResponderSystem';
import * as ResponderSystem from './ResponderSystem';
import type { ResponderNode } from './utils';

const emptyObject = {};
let idCounter = 0;

function useStable<T>(getInitialValue: () => T): T {
  const ref = useRef<T | null>(null);
  if (ref.current == null) {
    ref.current = getInitialValue();
  }
  return ref.current;
}

export default function useResponderEvents(
  hostRef: RefObject<Nullable<ResponderNode>>,
  config: ResponderConfig = emptyObject
) {
  const id = useStable(() => idCounter++);
  const isAttachedRef = useRef(false);

  // This is a separate effects so it doesn't run when the config changes.
  // On initial mount, attach global listeners if needed.
  // On unmount, remove node potentially attached to the Responder System.
  useEffect(() => {
    ResponderSystem.attachListeners();
    return () => {
      ResponderSystem.removeNode(id);
    };
  }, [id]);

  // Register and unregister with the Responder System as necessary
  useEffect(() => {
    const {
      onMoveShouldSetResponder,
      onMoveShouldSetResponderCapture,
      onScrollShouldSetResponder,
      onScrollShouldSetResponderCapture,
      onSelectionChangeShouldSetResponder,
      onSelectionChangeShouldSetResponderCapture,
      onStartShouldSetResponder,
      onStartShouldSetResponderCapture
    } = config;

    const requiresResponderSystem =
      onMoveShouldSetResponder != null ||
      onMoveShouldSetResponderCapture != null ||
      onScrollShouldSetResponder != null ||
      onScrollShouldSetResponderCapture != null ||
      onSelectionChangeShouldSetResponder != null ||
      onSelectionChangeShouldSetResponderCapture != null ||
      onStartShouldSetResponder != null ||
      onStartShouldSetResponderCapture != null;

    const node = hostRef.current;

    if (requiresResponderSystem) {
      ResponderSystem.addNode(id, node, config);
      isAttachedRef.current = true;
    } else if (isAttachedRef.current) {
      ResponderSystem.removeNode(id);
      isAttachedRef.current = false;
    }
  }, [config, hostRef, id]);

  useDebugValue({
    isResponder: hostRef.current === ResponderSystem.getResponderNode()
  });

  useDebugValue(config);
}
