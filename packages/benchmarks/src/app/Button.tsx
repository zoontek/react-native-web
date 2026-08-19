import type { ComponentProps } from 'react';

import { StyleSheet, TouchableHighlight, Text } from 'react-native-web';
import React, { Component } from 'react';

type Props = {
  onPress?: ComponentProps<typeof TouchableHighlight>['onPress'];
  style?: ComponentProps<typeof TouchableHighlight>['style'];
  title: string;
};

export default class Button extends Component<Props> {
  static displayName = '@app/Button';

  render() {
    const { onPress, style, title } = this.props;

    return (
      <TouchableHighlight
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.button, style]}
      >
        <Text style={styles.text}>{title}</Text>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 0,
    justifyContent: 'center'
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    padding: 8,
    textAlign: 'center',
    textTransform: 'uppercase'
  }
});
