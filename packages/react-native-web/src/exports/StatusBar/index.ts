/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function noop() {}

function StatusBar(): null {
  return null;
}

StatusBar.setBackgroundColor = noop;
StatusBar.setBarStyle = noop;
StatusBar.setHidden = noop;
StatusBar.setNetworkActivityIndicatorVisible = noop;
StatusBar.setTranslucent = noop;

export default StatusBar;
