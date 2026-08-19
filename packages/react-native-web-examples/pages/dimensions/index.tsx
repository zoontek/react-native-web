import { Dimensions, Text } from 'react-native-web';
import Example from '../../shared/example';
import { useEffect, useState } from 'react';

export default function DimensionsPage() {
  const [screenDims, setScreen] = useState(Dimensions.get('screen'));
  const [windowDims, setWindow] = useState(Dimensions.get('window'));

  useEffect(() => {
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
