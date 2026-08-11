/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const uppercasePattern = /[A-Z]/g;
const msPattern = /^ms-/;
const cache: Record<string, string> = {};

function toHyphenLower(match: string) {
  return '-' + match.toLowerCase();
}

function hyphenateStyleName(name: string): string {
  const cached = cache[name];

  if (cached != null) {
    return cached;
  }

  const hName = name.replace(uppercasePattern, toHyphenLower);
  return (cache[name] = msPattern.test(hName) ? '-' + hName : hName);
}

export default hyphenateStyleName;
