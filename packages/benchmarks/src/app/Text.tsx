import type { ComponentProps } from 'react';

import React from 'react';
import { StyleSheet, Text } from 'react-native-web';
import { colors } from './theme';

type Props = ComponentProps<typeof Text>;

class AppText extends React.Component<Props> {
  static displayName = '@app/Text';

  render() {
    const { style, ...rest } = this.props;
    return <Text {...rest} style={[styles.baseText, style]} />;
  }
}

const styles = StyleSheet.create({
  baseText: {
    color: colors.textBlack,
    fontSize: '1rem',
    lineHeight: '1.3125em'
  }
});

export default AppText;
