/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type AlertClass = typeof import('react-native').Alert;

const Alert: AlertClass = class {
  static alert() {}
  static prompt() {}
};

export default Alert;
