/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import type * as RN from 'react-native';

let clipboardAvailable: boolean | undefined;

const Clipboard: typeof RN.Clipboard = class {
  static isAvailable = () => {
    if (clipboardAvailable == null) {
      clipboardAvailable =
        typeof document.queryCommandSupported === 'function' &&
        document.queryCommandSupported('copy');
    }

    return clipboardAvailable;
  };

  static getString = () => Promise.resolve('');

  static setString = (text) => {
    const body = document.body;

    if (body != null) {
      // add the text to a hidden node
      const node = document.createElement('span');
      node.textContent = text;
      node.style.opacity = '0';
      node.style.position = 'absolute';
      node.style.whiteSpace = 'pre-wrap';
      node.style.userSelect = 'auto';
      body.appendChild(node);

      // select the text
      const selection = window.getSelection();

      if (selection != null) {
        selection.removeAllRanges();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.addRange(range);

        // attempt to copy
        try {
          document.execCommand('copy');
        } catch {}

        // remove selection
        selection.removeAllRanges();
      }

      // remove node
      body.removeChild(node);
    }
  };
};

export default Clipboard;
