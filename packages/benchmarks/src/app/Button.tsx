import { Component, type ComponentProps } from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native-web';

type Props = {
  onPress?: ComponentProps<typeof TouchableHighlight>['onPress'];
  style?: ComponentProps<typeof TouchableHighlight>['style'];
  title: string;
};

export default class Button extends Component<Props> {
  static displayName = '@app/Button';

  override render() {
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
