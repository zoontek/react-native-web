/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ColorValue, GenericStyleProp, Nullable } from '../../types';
import type { TextStyle } from '../Text/types';
import type { ViewProps } from '../View/types';

export type TextInputStyle = TextStyle & {
  caretColor?: ColorValue;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
};

export type TextInputProps = Omit<ViewProps, 'dir' | 'onScroll' | 'style'> & {
  autoCapitalize?: 'characters' | 'none' | 'sentences' | 'words';
  autoComplete?: Nullable<string>;
  autoCompleteType?: Nullable<string>; // Compat with React Native (Bug react-native#26003)
  autoCorrect?: Nullable<boolean>;
  autoFocus?: Nullable<boolean>;
  blurOnSubmit?: Nullable<boolean>;
  caretHidden?: Nullable<boolean>;
  clearTextOnFocus?: Nullable<boolean>;
  defaultValue?: Nullable<string>;
  dir?: Nullable<'auto' | 'ltr' | 'rtl'>;
  disabled?: Nullable<boolean>;
  enterKeyHint?:
    | 'enter'
    | 'done'
    | 'go'
    | 'next'
    | 'previous'
    | 'search'
    | 'send';
  inputAccessoryViewID?: Nullable<string>;
  inputMode?:
    | 'decimal'
    | 'email'
    | 'none'
    | 'numeric'
    | 'search'
    | 'tel'
    | 'text'
    | 'url';
  maxLength?: Nullable<number>;
  multiline?: Nullable<boolean>;
  onChange?: (e: unknown) => void;
  onChangeText?: (e: string) => void;
  onContentSizeChange?: (e: unknown) => void;
  onEndEditing?: (e: unknown) => void;
  onKeyPress?: (e: unknown) => void;
  onSelectionChange?: (e: unknown) => void;
  onScroll?: (e: unknown) => void;
  onSubmitEditing?: (e: unknown) => void;
  placeholder?: Nullable<string>;
  placeholderTextColor?: Nullable<ColorValue>;
  readOnly?: Nullable<boolean>;
  rows?: Nullable<number>;
  secureTextEntry?: Nullable<boolean>;
  selectTextOnFocus?: Nullable<boolean>;
  selection?: {
    start: number;
    end?: number;
  };
  selectionColor?: Nullable<ColorValue>;
  showSoftInputOnFocus?: Nullable<boolean>;
  spellCheck?: Nullable<boolean>;
  style?: GenericStyleProp<TextInputStyle>;
  value?: Nullable<string>;
  // deprecated
  editable?: Nullable<boolean>;
  keyboardType?:
    | 'default'
    | 'decimal-pad'
    | 'email-address'
    | 'number-pad'
    | 'numbers-and-punctuation'
    | 'numeric'
    | 'phone-pad'
    | 'search'
    | 'url'
    | 'web-search';
  numberOfLines?: Nullable<number>;
  returnKeyType?:
    | 'enter'
    | 'done'
    | 'go'
    | 'next'
    | 'previous'
    | 'search'
    | 'send';
};
