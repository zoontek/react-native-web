/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const noop = () => {};

/**
 * `Touchable` predates `Pressable` and nothing in react-native-web uses it.
 * Only the members react-native-svg reads off `Mixin` are kept, as no-ops:
 * it calls them directly, so they cannot be `undefined`.
 * https://github.com/software-mansion/react-native-svg/blob/v15.15.5/src/lib/SvgTouchableMixin.ts
 */
const Touchable = {
  Mixin: {
    touchableGetInitialState: () => ({
      touchable: { touchState: undefined, responderID: null }
    }),
    touchableHandleStartShouldSetResponder: () => false,
    touchableHandleResponderTerminationRequest: () => true,
    touchableHandleResponderGrant: noop,
    touchableHandleResponderMove: noop,
    touchableHandleResponderRelease: noop,
    touchableHandleResponderTerminate: noop
  }
};

export default Touchable;
