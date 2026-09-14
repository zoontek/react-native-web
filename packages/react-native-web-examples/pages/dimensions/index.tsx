import React from 'react';
import { Dimensions, Text } from 'react-native-web';
import Example from '../../shared/example';

export default function DimensionsPage() {
  const [screenDims, setScreen] = React.useState(Dimensions.get('screen'));
  const [windowDims, setWindow] = React.useState(Dimensions.get('window'));

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ screen, window }) => {
        setScreen(screen);
        setWindow(window);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [setScreen, setWindow]);

  return (
    <Example title="Dimensions">
      <Text style={{ marginVertical: '1em' }} suppressHydrationWarning={true}>
        window: {JSON.stringify(windowDims, null, 2)}
      </Text>
      <Text suppressHydrationWarning={true}>
        screen: {JSON.stringify(screenDims, null, 2)}
      </Text>
    </Example>
  );
}
