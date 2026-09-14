import { Component, PureComponent, type ComponentRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native-web';

import Example from '../../shared/example';

const CIRCLE_SIZE = 80;

// TODO: use PanResponder* types
type PanResponderConfig = Parameters<typeof PanResponder.create>[0];
type PassiveCallback = NonNullable<PanResponderConfig['onPanResponderMove']>;

type ActiveCallback = NonNullable<
  PanResponderConfig['onStartShouldSetPanResponder']
>;

type CircleStyles = {
  left: number;
  top: number;
  backgroundColor: string;
};

class DraggableCircle extends PureComponent {
  _panResponder: ReturnType<typeof PanResponder.create>;
  _previousLeft = 0;
  _previousTop = 0;
  _circleStyles: CircleStyles;
  circle: ComponentRef<typeof View> | null = null;

  constructor(props: object) {
    super(props);
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd
    });
    this._previousLeft = 20;
    this._previousTop = 84;
    this._circleStyles = {
      left: this._previousLeft,
      top: this._previousTop,
      backgroundColor: 'green'
    };
  }

  componentDidMount() {
    this._updateNativeStyles();
  }

  render() {
    return (
      <View style={styles.container}>
        {/* @ts-expect-error */}
        <View
          ref={this._setCircleRef}
          style={[styles.circle, this._circleStyles]}
          {...this._panResponder.panHandlers}
        />
      </View>
    );
  }

  _setCircleRef = (circle: ComponentRef<typeof View> | null) => {
    this.circle = circle;
  };

  _highlight() {
    this._circleStyles.backgroundColor = 'blue';
    this._updateNativeStyles();
  }

  _unHighlight() {
    this._circleStyles.backgroundColor = 'green';
    this._updateNativeStyles();
  }

  _updateNativeStyles() {
    this.forceUpdate();
  }

  _handleStartShouldSetPanResponder: ActiveCallback = (e, gestureState) => {
    // Should we become active when the user presses down on the circle?
    return true;
  };

  _handleMoveShouldSetPanResponder: ActiveCallback = (e, gestureState) => {
    // Should we become active when the user moves a touch over the circle?
    return true;
  };

  _handlePanResponderGrant: PassiveCallback = (e, gestureState) => {
    this._highlight();
  };

  _handlePanResponderMove: PassiveCallback = (e, gestureState) => {
    this._circleStyles.left = this._previousLeft + gestureState.dx;
    this._circleStyles.top = this._previousTop + gestureState.dy;
    this._updateNativeStyles();
  };

  _handlePanResponderEnd: PassiveCallback = (e, gestureState) => {
    this._unHighlight();
    this._previousLeft += gestureState.dx;
    this._previousTop += gestureState.dy;
  };
}

type LocationXYState = {
  translateX: number;
};

class LocationXY extends Component<object, LocationXYState> {
  panResponder: ReturnType<typeof PanResponder.create>;

  constructor(props: object) {
    super(props);
    this.state = { translateX: 0 };
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderTerminationRequest: () => true
    });
  }

  _handlePanResponderMove: PassiveCallback = (e, gestureState) => {
    console.log(e.nativeEvent.locationX, e.nativeEvent.locationY);
    this.setState((state) => ({
      ...state,
      translateX: gestureState.dx
    }));
  };

  render() {
    const transform = { transform: `translateX(${this.state.translateX}px)` };
    return (
      <View style={styles.box}>
        {/* @ts-expect-error */}
        <View style={styles.outer} {...this.panResponder.panHandlers}>
          <View style={[styles.inner, transform]} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    position: 'absolute',
    left: 0,
    top: 0,
    touchAction: 'none'
  },
  container: {
    alignSelf: 'stretch',
    minHeight: 300,
    paddingTop: 64
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  outer: {
    width: 250,
    height: 50,
    backgroundColor: 'skyblue'
  },
  inner: {
    width: 30,
    height: 30,
    backgroundColor: 'lightblue'
  }
});

export default function PanResponderPage() {
  return (
    <Example title="PanResponder">
      <DraggableCircle />
      <LocationXY />
    </Example>
  );
}
