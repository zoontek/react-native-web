/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import UIManager from '../../exports/UIManager';
import type { Nullable } from '../../types';

type TextInputStateStatic = {
  /**
   * Internal state
   */
  _currentlyFocusedNode: Nullable<HTMLElement>;

  /**
   * Returns the ID of the currently focused text field, if one exists
   * If no text field is focused it returns null
   */
  currentlyFocusedField(): Nullable<HTMLElement>;

  /**
   * @param {Object} TextInputID id of the text field to focus
   * Focuses the specified text field
   * noop if the text field was already focused
   */
  focusTextInput(textFieldNode: Nullable<HTMLElement>): void;

  /**
   * @param {Object} textFieldNode id of the text field to focus
   * Unfocuses the specified text field
   * noop if it wasn't focused
   */
  blurTextInput(textFieldNode: Nullable<HTMLElement>): void;
};

/**
 * This class is responsible for coordinating the "focused"
 * state for TextInputs. All calls relating to the keyboard
 * should be funneled through here
 */
const TextInputState: TextInputStateStatic = {
  /**
   * Internal state
   */
  _currentlyFocusedNode: null,

  currentlyFocusedField() {
    if (document.activeElement !== this._currentlyFocusedNode) {
      this._currentlyFocusedNode = null;
    }
    return this._currentlyFocusedNode;
  },

  focusTextInput(textFieldNode) {
    if (textFieldNode != null) {
      this._currentlyFocusedNode = textFieldNode;
      if (document.activeElement !== textFieldNode) {
        UIManager.focus(textFieldNode);
      }
    }
  },

  blurTextInput(textFieldNode) {
    if (textFieldNode != null) {
      this._currentlyFocusedNode = null;
      if (document.activeElement === textFieldNode) {
        UIManager.blur(textFieldNode);
      }
    }
  }
};

export default TextInputState;
