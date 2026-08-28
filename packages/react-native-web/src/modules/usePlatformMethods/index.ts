/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import UIManager from '../../exports/UIManager';
import type { Nullable, PlatformMethods } from '../../types';
import useStable from '../useStable';

type PlatformMethodsNode = HTMLElement & PlatformMethods;

/**
 * Adds non-standard methods to the hode element. This is temporarily until an
 * API like `ReactNative.measure(hostRef, callback)` is added to React Native.
 */
export default function usePlatformMethods(): (
  hostNode: Nullable<PlatformMethodsNode>
) => void {
  // Avoid creating a new ref on every render.
  return useStable(() => (hostNode: Nullable<PlatformMethodsNode>) => {
    if (hostNode != null) {
      hostNode.measure = (callback) => UIManager.measure(hostNode, callback);
      hostNode.measureLayout = (relativeToNode, success, failure) =>
        UIManager.measureLayout(hostNode, relativeToNode, failure, success);
      hostNode.measureInWindow = (callback) =>
        UIManager.measureInWindow(hostNode, callback);
    }
  });
}
