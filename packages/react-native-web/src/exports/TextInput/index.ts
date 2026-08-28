/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref,
  type SyntheticEvent
} from 'react';

import type { ElementProps } from '../../modules/createDOMProps';
import * as forwardedProps from '../../modules/forwardedProps';
import pick from '../../modules/pick';
import TextInputState from '../../modules/TextInputState';
import useElementLayout from '../../modules/useElementLayout';
import useLayoutEffect from '../../modules/useLayoutEffect';
import { getLocaleDirection, useLocaleContext } from '../../modules/useLocale';
import useMergeRefs from '../../modules/useMergeRefs';
import usePlatformMethods from '../../modules/usePlatformMethods';
import useResponderEvents from '../../modules/useResponderEvents';
import type { Nullable, PlatformMethods } from '../../types';
import createElement from '../createElement';
import StyleSheet from '../StyleSheet';
import type { TextInputProps as Props } from './types';

type TextInputNode = (HTMLInputElement | HTMLTextAreaElement) &
  PlatformMethods & {
    clear?: () => void;
    isFocused?: () => boolean;
  };

type TextInputSelection = {
  start: number | null;
  end?: number | null;
};

/**
 * Determines whether a 'selection' prop differs from a node's existing
 * selection state.
 */
const isSelectionStale = (
  node: HTMLInputElement | HTMLTextAreaElement,
  selection: TextInputSelection
) => {
  const { selectionEnd, selectionStart } = node;
  const { start, end } = selection;
  return start !== selectionStart || end !== selectionEnd;
};

/**
 * Certain input types do no support 'selectSelectionRange' and will throw an
 * error.
 */
const setSelection = (
  node: HTMLInputElement | HTMLTextAreaElement,
  selection: TextInputSelection
) => {
  if (isSelectionStale(node, selection)) {
    const { start, end } = selection;
    try {
      node.setSelectionRange(start, end || start);
    } catch {}
  }
};

const forwardPropsList = Object.assign(
  {},
  forwardedProps.defaultProps,
  forwardedProps.accessibilityProps,
  forwardedProps.clickProps,
  forwardedProps.focusProps,
  forwardedProps.keyboardProps,
  forwardedProps.mouseProps,
  forwardedProps.touchProps,
  forwardedProps.styleProps,
  {
    autoCapitalize: true,
    autoComplete: true,
    autoCorrect: true,
    autoFocus: true,
    defaultValue: true,
    disabled: true,
    lang: true,
    maxLength: true,
    onChange: true,
    onScroll: true,
    placeholder: true,
    pointerEvents: true,
    readOnly: true,
    rows: true,
    spellCheck: true,
    value: true,
    type: true
  }
);

const pickProps = (props: Props): ElementProps => pick(props, forwardPropsList);

// If an Input Method Editor is processing key input, the 'keyCode' is 229.
// https://www.w3.org/TR/uievents/#determine-keydown-keyup-keyCode
function isEventComposing(nativeEvent: KeyboardEvent) {
  return nativeEvent.isComposing || nativeEvent.keyCode === 229;
}

let focusTimeout: Nullable<ReturnType<typeof setTimeout>> = null;

const TextInput = (props: Props & { ref?: Ref<TextInputNode> }) => {
  const {
    autoCapitalize = 'sentences',
    autoComplete,
    autoCompleteType,
    autoCorrect = true,
    blurOnSubmit,
    caretHidden,
    clearTextOnFocus,
    dir,
    editable,
    enterKeyHint,
    inputMode,
    keyboardType,
    multiline = false,
    numberOfLines,
    onBlur,
    onChange,
    onChangeText,
    onContentSizeChange,
    onFocus,
    onKeyPress,
    onLayout,
    onMoveShouldSetResponder,
    onMoveShouldSetResponderCapture,
    onResponderEnd,
    onResponderGrant,
    onResponderMove,
    onResponderReject,
    onResponderRelease,
    onResponderStart,
    onResponderTerminate,
    onResponderTerminationRequest,
    onScrollShouldSetResponder,
    onScrollShouldSetResponderCapture,
    onSelectionChange,
    onSelectionChangeShouldSetResponder,
    onSelectionChangeShouldSetResponderCapture,
    onStartShouldSetResponder,
    onStartShouldSetResponderCapture,
    onSubmitEditing,
    placeholderTextColor,
    readOnly = false,
    ref,
    returnKeyType,
    rows,
    secureTextEntry = false,
    selection,
    selectTextOnFocus,
    showSoftInputOnFocus,
    spellCheck
  } = props;

  let type;
  let _inputMode;

  if (inputMode != null) {
    _inputMode = inputMode;
    if (inputMode === 'email') {
      type = 'email';
    } else if (inputMode === 'tel') {
      type = 'tel';
    } else if (inputMode === 'search') {
      type = 'search';
    } else if (inputMode === 'url') {
      type = 'url';
    } else {
      type = 'text';
    }
  } else if (keyboardType != null) {
    // warnOnce('keyboardType', 'keyboardType is deprecated. Use inputMode.');
    switch (keyboardType) {
      case 'email-address':
        type = 'email';
        break;
      case 'number-pad':
      case 'numeric':
        _inputMode = 'numeric';
        break;
      case 'decimal-pad':
        _inputMode = 'decimal';
        break;
      case 'phone-pad':
        type = 'tel';
        break;
      case 'search':
      case 'web-search':
        type = 'search';
        break;
      case 'url':
        type = 'url';
        break;
      default:
        type = 'text';
    }
  }

  if (secureTextEntry) {
    type = 'password';
  }

  const dimensions = useRef<{
    height: Nullable<number>;
    width: Nullable<number>;
  }>({ height: null, width: null });
  const hostRef = useRef<TextInputNode | null>(null);
  const prevSelection = useRef<TextInputSelection | null>(null);
  const prevSecureTextEntry = useRef<Nullable<boolean>>(false);

  useEffect(() => {
    if (hostRef.current && prevSelection.current) {
      setSelection(hostRef.current, prevSelection.current);
    }
    prevSecureTextEntry.current = secureTextEntry;
  }, [secureTextEntry]);

  const handleContentSizeChange = useCallback(
    (hostNode: HTMLInputElement | HTMLTextAreaElement) => {
      if (multiline && onContentSizeChange && hostNode != null) {
        const newHeight = hostNode.scrollHeight;
        const newWidth = hostNode.scrollWidth;
        if (
          newHeight !== dimensions.current.height ||
          newWidth !== dimensions.current.width
        ) {
          dimensions.current.height = newHeight;
          dimensions.current.width = newWidth;
          onContentSizeChange({
            nativeEvent: {
              contentSize: {
                height: dimensions.current.height,
                width: dimensions.current.width
              }
            }
          });
        }
      }
    },
    [multiline, onContentSizeChange]
  );

  const imperativeRef = useMemo(
    () => (hostNode: TextInputNode | null) => {
      // TextInput needs to add more methods to the hostNode in addition to those
      // added by `usePlatformMethods`. This is temporarily until an API like
      // `TextInput.clear(hostRef)` is added to React Native.
      if (hostNode != null) {
        hostNode.clear = function () {
          if (hostNode != null) {
            hostNode.value = '';
          }
        };
        hostNode.isFocused = function () {
          return (
            hostNode != null &&
            TextInputState.currentlyFocusedField() === hostNode
          );
        };
        handleContentSizeChange(hostNode);
      }
    },
    [handleContentSizeChange]
  );

  function handleBlur(
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement> & {
      nativeEvent: { text?: string };
    }
  ) {
    TextInputState._currentlyFocusedNode = null;
    if (onBlur) {
      e.nativeEvent.text = e.target.value;
      onBlur(e);
    }
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> & {
      nativeEvent: { text?: string };
    }
  ) {
    const hostNode = e.target;
    const text = hostNode.value;
    e.nativeEvent.text = text;
    handleContentSizeChange(hostNode);
    if (onChange) {
      onChange(e);
    }
    if (onChangeText) {
      onChangeText(text);
    }
  }

  function handleFocus(
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement> & {
      nativeEvent: { text?: string };
    }
  ) {
    const hostNode = e.target;
    if (onFocus) {
      e.nativeEvent.text = hostNode.value;
      onFocus(e);
    }
    if (hostNode != null) {
      TextInputState._currentlyFocusedNode = hostNode;
      if (clearTextOnFocus) {
        hostNode.value = '';
      }
      if (selectTextOnFocus) {
        // Safari requires selection to occur in a setTimeout
        if (focusTimeout != null) {
          clearTimeout(focusTimeout);
        }
        focusTimeout = setTimeout(() => {
          // Check if the input is still focused after the timeout
          // (see #2704)
          if (hostNode != null && document.activeElement === hostNode) {
            hostNode.select();
          }
        }, 0);
      }
    }
  }

  function handleKeyDown(
    e: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement> & {
      target: HTMLInputElement | HTMLTextAreaElement;
      nativeEvent: { text?: string };
    }
  ) {
    const hostNode = e.target;
    // Prevent key events bubbling (see #612)
    e.stopPropagation();

    const blurOnSubmitDefault = !multiline;
    const shouldBlurOnSubmit =
      blurOnSubmit == null ? blurOnSubmitDefault : blurOnSubmit;

    const nativeEvent = e.nativeEvent;
    const isComposing = isEventComposing(nativeEvent);

    if (onKeyPress) {
      onKeyPress(e);
    }

    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      // Do not call submit if composition is occuring.
      !isComposing &&
      !e.isDefaultPrevented()
    ) {
      if ((blurOnSubmit || !multiline) && onSubmitEditing) {
        // prevent "Enter" from inserting a newline or submitting a form
        e.preventDefault();
        nativeEvent.text = e.target.value;
        onSubmitEditing(e);
      }
      if (shouldBlurOnSubmit && hostNode != null) {
        setTimeout(() => hostNode.blur(), 0);
      }
    }
  }

  function handleSelectionChange(
    e: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement> & {
      target: HTMLInputElement | HTMLTextAreaElement;
      nativeEvent: { selection?: TextInputSelection; text?: string };
    }
  ) {
    try {
      const { selectionStart, selectionEnd } = e.target;
      const selection = {
        start: selectionStart,
        end: selectionEnd
      };
      if (onSelectionChange) {
        e.nativeEvent.selection = selection;
        e.nativeEvent.text = e.target.value;
        onSelectionChange(e);
      }
      if (prevSecureTextEntry.current === secureTextEntry) {
        prevSelection.current = selection;
      }
    } catch {}
  }

  useLayoutEffect(() => {
    const node = hostRef.current;
    if (node != null && selection != null) {
      setSelection(node, selection);
    }
    if (document.activeElement === node) {
      TextInputState._currentlyFocusedNode = node;
    }
  }, [hostRef, selection]);

  const component = multiline ? 'textarea' : 'input';

  useElementLayout(hostRef, onLayout);
  useResponderEvents(hostRef, {
    onMoveShouldSetResponder,
    onMoveShouldSetResponderCapture,
    onResponderEnd,
    onResponderGrant,
    onResponderMove,
    onResponderReject,
    onResponderRelease,
    onResponderStart,
    onResponderTerminate,
    onResponderTerminationRequest,
    onScrollShouldSetResponder,
    onScrollShouldSetResponderCapture,
    onSelectionChangeShouldSetResponder,
    onSelectionChangeShouldSetResponderCapture,
    onStartShouldSetResponder,
    onStartShouldSetResponderCapture
  });
  const { direction: contextDirection } = useLocaleContext();

  const supportedProps = pickProps(props);
  supportedProps.autoCapitalize = autoCapitalize;
  supportedProps.autoComplete = autoComplete || autoCompleteType || 'on';
  supportedProps.autoCorrect = autoCorrect ? 'on' : 'off';
  // 'auto' by default allows browsers to infer writing direction
  supportedProps.dir = dir !== undefined ? dir : 'auto';
  supportedProps.enterKeyHint = enterKeyHint || returnKeyType;
  supportedProps.inputMode = _inputMode;
  supportedProps.onBlur = handleBlur;
  supportedProps.onChange = handleChange;
  supportedProps.onFocus = handleFocus;
  supportedProps.onKeyDown = handleKeyDown;
  supportedProps.onSelect = handleSelectionChange;
  supportedProps.readOnly = readOnly === true || editable === false;
  supportedProps.rows = multiline ? (rows != null ? rows : numberOfLines) : 1;
  supportedProps.spellCheck = spellCheck != null ? spellCheck : autoCorrect;
  supportedProps.style = [
    { '--placeholderTextColor': placeholderTextColor },
    styles.textinput$raw,
    styles.placeholder,
    props.style,
    caretHidden && styles.caretHidden
  ];
  supportedProps.type = multiline ? undefined : type;
  supportedProps.virtualkeyboardpolicy =
    showSoftInputOnFocus === false ? 'manual' : 'auto';

  const platformMethodsRef = usePlatformMethods();

  const setRef = useMergeRefs(hostRef, platformMethodsRef, imperativeRef, ref);

  supportedProps.ref = setRef;

  const langDirection =
    props.lang != null ? getLocaleDirection(props.lang) : null;
  const componentDirection = props.dir || langDirection;
  const writingDirection = componentDirection || contextDirection;

  const element = createElement(component, supportedProps, {
    writingDirection
  });

  return element;
};

TextInput.displayName = 'TextInput';
TextInput.State = TextInputState;

const styles = StyleSheet.create({
  textinput$raw: {
    MozAppearance: 'textfield',
    WebkitAppearance: 'none',
    backgroundColor: 'transparent',
    border: '0 solid black',
    borderRadius: 0,
    boxSizing: 'border-box',
    font: '14px System',
    margin: 0,
    padding: 0,
    resize: 'none'
  },
  placeholder: {
    placeholderTextColor: 'var(--placeholderTextColor)'
  },
  caretHidden: {
    caretColor: 'transparent'
  }
});

export default TextInput;
