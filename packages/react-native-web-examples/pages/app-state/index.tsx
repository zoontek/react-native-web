import { useEffect, useState } from 'react';
import { AppState, Text } from 'react-native-web';

import Example from '../../shared/example';

export default function AppStatePage() {
  const [state, setState] = useState(() => ({
    currentState: AppState.currentState,
    active: 0,
    background: 0
  }));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setState((previousState) => ({
        ...previousState,
        currentState: nextState,
        [nextState]: previousState[nextState] + 1
      }));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Example title="AppState">
      <Text style={{ marginTop: '1rem' }}>
        AppState.currentState:{' '}
        <Text style={{ fontWeight: 'bold' }}>{state.currentState}</Text>
      </Text>
      <Text>Active count: {state.active}</Text>
      <Text>Background count: {state.background}</Text>
    </Example>
  );
}
