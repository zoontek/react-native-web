import {
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View
} from 'react-native-web';
import Button from '../../shared/button';
import Example from '../../shared/example';
import { useRef, useState, type ComponentRef } from 'react';

const ITEMS = [...Array(12)].map((_, i) => `Item ${i}`);

function createItemRow(msg: string, index: number) {
  return (
    <Pressable key={index} style={[styles.item]}>
      <Text style={styles.text}>{msg}</Text>
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function ScrollViewPage() {
  const [scrollEnabled, setEnabled] = useState(true);
  const [throttle, setThrottle] = useState(16);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  return (
    <Example title="ScrollView">
      <View style={styles.container}>
        <ScrollView
          onScroll={() => {
            console.log('onScroll');
          }}
          ref={scrollRef}
          scrollEnabled={scrollEnabled}
          scrollEventThrottle={throttle}
          style={[styles.scrollView, !scrollEnabled && styles.disabled]}
        >
          {ITEMS.map(createItemRow)}
        </ScrollView>

        <View style={styles.buttons}>
          <Button
            onPress={() => {
              setEnabled((val) => !val);
            }}
            title={scrollEnabled ? 'Disable' : 'Enable'}
          />
          <Divider />
          <Button
            onPress={() => {
              setThrottle((val) => (val !== 16 ? 16 : 1000));
            }}
            title="Throttle"
          />
        </View>
        <View style={styles.buttons}>
          <Button
            onPress={() => {
              // @ts-expect-error
              scrollRef.current?.scrollTo({ y: 0 });
            }}
            title="To start"
          />
          <Divider />
          <Button
            onPress={() => {
              // @ts-expect-error
              scrollRef.current?.scrollTo({ y: 50 });
            }}
            title="To 50px"
          />
          <Divider />
          <Button
            onPress={() => {
              // @ts-expect-error
              scrollRef.current?.scrollToEnd({ animated: true });
            }}
            title="To end"
          />
        </View>
      </View>
    </Example>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch'
  },
  scrollView: {
    backgroundColor: '#eeeeee',
    maxHeight: 250
  },
  disabled: {
    opacity: 0.5
  },
  item: {
    margin: 5,
    padding: 5,
    backgroundColor: '#cccccc',
    borderRadius: 3,
    minWidth: 96
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 5
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: '1rem'
  },
  divider: {
    width: '1rem'
  }
});
