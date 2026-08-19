/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Ref } from 'react';

import type { Nullable, PlatformMethods } from '../../types';
import StyleSheet from '../StyleSheet';
import Text from '../Text';
import TouchableOpacity from '../TouchableOpacity';

type ButtonProps = {
  accessibilityLabel?: Nullable<string>;
  color?: Nullable<string>;
  disabled?: boolean;
  onPress?: Nullable<(e: unknown) => void>;
  ref?: Ref<HTMLElement & PlatformMethods>;
  testID?: Nullable<string>;
  title: string;
};

const Button = (props: ButtonProps) => {
  const { accessibilityLabel, color, disabled, onPress, ref, testID, title } =
    props;

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      focusable={!disabled}
      onPress={onPress}
      ref={ref}
      style={[
        styles.button,
        color && { backgroundColor: color },
        disabled && styles.buttonDisabled
      ]}
      testID={testID}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 2
  },
  text: {
    color: '#fff',
    fontWeight: '500',
    padding: 8,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  buttonDisabled: {
    backgroundColor: '#dfdfdf'
  },
  textDisabled: {
    color: '#a1a1a1'
  }
});

export type { ButtonProps };

export default Button;
