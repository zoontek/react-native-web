/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Switch,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native-web';
import bandaged from '../../assets/lists/bandaged.png';
import call from '../../assets/lists/call.png';
import dislike from '../../assets/lists/dislike.png';
import fist from '../../assets/lists/fist.png';
import flowers from '../../assets/lists/flowers.png';
import heart from '../../assets/lists/heart.png';
import like from '../../assets/lists/like.png';
import liking from '../../assets/lists/liking.png';
import party from '../../assets/lists/party.png';
import poke from '../../assets/lists/poke.png';
import superlike from '../../assets/lists/superlike.png';
import victory from '../../assets/lists/victory.png';
import Example from '../../shared/example';
import { PureComponent, type ComponentProps } from 'react';

type Item = {
  title: string;
  text: string;
  key: string;
  pressed: boolean;
  noImage?: boolean | null;
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const HEADER = { height: 30, width: 100 };
const SEPARATOR_HEIGHT = StyleSheet.hairlineWidth;
const HORIZ_WIDTH = 200;
const ITEM_HEIGHT = 72;
const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true
};
const THUMB_URLS = [
  like,
  dislike,
  call,
  fist,
  bandaged,
  flowers,
  heart,
  liking,
  party,
  poke,
  superlike,
  victory
];
const LOREM_IPSUM =
  'Lorem ipsum dolor sit amet, ius ad pertinax oportere accommodare, an vix ' +
  'civibus corrumpit referrentur. Te nam case ludus inciderint, te mea facilisi adipiscing. Sea id ' +
  'integre luptatum. In tota sale consequuntur nec. Erat ocurreret mei ei. Eu paulo sapientem ' +
  'vulputate est, vel an accusam intellegam interesset. Nam eu stet pericula reprimique, ea vim illud ' +
  'modus, putant invidunt reprehendunt ne qui.';

function genItemData(count: number, start: number = 0): Array<Item> {
  const dataBlob: Array<Item> = [];
  for (let ii = start; ii < count + start; ii++) {
    const itemHash = Math.abs(hashCode('Item ' + ii));
    dataBlob.push({
      title: 'Item ' + ii,
      text: LOREM_IPSUM.substr(0, (itemHash % 301) + 20),
      key: String(ii),
      pressed: false
    });
  }
  return dataBlob;
}

type ItemComponentProps = {
  fixedHeight?: boolean | null;
  horizontal?: boolean | null;
  item: Item;
  onPress: (key: string) => void;
  onShowUnderlay?: () => void;
  onHideUnderlay?: () => void;
};

class ItemComponent extends PureComponent<ItemComponentProps> {
  _onPress = () => {
    this.props.onPress(this.props.item.key);
  };
  render() {
    const { fixedHeight, horizontal, item } = this.props;
    const itemHash = Math.abs(hashCode(item.title));
    const imgSource = THUMB_URLS[itemHash % THUMB_URLS.length];
    return (
      <Pressable
        onPress={this._onPress}
        onPressIn={this.props.onShowUnderlay}
        onPressOut={this.props.onHideUnderlay}
        style={horizontal ? styles.horizItem : styles.item}
      >
        <View
          style={[
            styles.row,
            horizontal && { width: HORIZ_WIDTH },
            fixedHeight && { height: ITEM_HEIGHT }
          ]}
        >
          {!item.noImage && <Image source={imgSource} style={styles.thumb} />}
          <Text
            numberOfLines={horizontal || fixedHeight ? 3 : undefined}
            style={styles.text}
          >
            {item.title} - {item.text}
          </Text>
        </View>
      </Pressable>
    );
  }
}

class FooterComponent extends PureComponent {
  render() {
    return (
      <View style={styles.headerFooterContainer}>
        <SeparatorComponent />
        <View style={styles.headerFooter}>
          <Text>LIST FOOTER</Text>
        </View>
      </View>
    );
  }
}

class HeaderComponent extends PureComponent {
  render() {
    return (
      <View style={styles.headerFooterContainer}>
        <View style={styles.headerFooter}>
          <Text>LIST HEADER</Text>
        </View>
        <SeparatorComponent />
      </View>
    );
  }
}

class SeparatorComponent extends PureComponent {
  render() {
    return <View style={styles.separator} />;
  }
}

class ItemSeparatorComponent extends PureComponent<{
  highlighted: boolean;
  leadingItem: unknown;
}> {
  render() {
    const style = this.props.highlighted
      ? [
          styles.itemSeparator,
          { marginLeft: 0, backgroundColor: 'rgb(217, 217, 217)' }
        ]
      : styles.itemSeparator;
    return <View style={style} />;
  }
}

class Spindicator extends PureComponent<{
  value: InstanceType<typeof Animated.Value>;
}> {
  render() {
    return (
      <Animated.View
        style={[
          // @ts-expect-error
          styles.spindicator,
          {
            // @ts-expect-error
            rotate: this.props.value.interpolate({
              inputRange: [0, 5000],
              outputRange: ['0deg', '360deg'],
              extrapolate: 'extend'
            })
          }
        ]}
      />
    );
  }
}

function hashCode(str: string): number {
  let hash = 15;
  for (let ii = str.length - 1; ii >= 0; ii--) {
    hash = (hash << 5) - hash + str.charCodeAt(ii);
  }
  return hash;
}

function getItemLayout(
  data: unknown,
  index: number,
  horizontal?: boolean | null
) {
  const [length, separator, header] = horizontal
    ? [HORIZ_WIDTH, 0, HEADER.width]
    : [ITEM_HEIGHT, SEPARATOR_HEIGHT, HEADER.height];
  return { length, offset: (length + separator) * index + header, index };
}

function pressItem(context: SingleColumnExample, key: string) {
  const index = Number(key);
  const pressed = !(context.state.data[index] as Item).pressed;
  context.setState((state) => {
    const newData = [...state.data];
    newData[index] = {
      ...(state.data[index] as Item),
      pressed,
      title: 'Item ' + key + (pressed ? ' (pressed)' : '')
    };
    return { data: newData };
  });
}

type SwitchOptionKey =
  | 'debug'
  | 'fixedHeight'
  | 'horizontal'
  | 'inverted'
  | 'logViewable'
  | 'virtualized';

function renderSmallSwitchOption(
  context: SingleColumnExample,
  key: SwitchOptionKey
) {
  return (
    <View style={styles.option}>
      <Text>{key}:</Text>
      <Switch
        onValueChange={(value) =>
          context.setState({ [key]: value } as Pick<State, SwitchOptionKey>)
        }
        style={styles.smallSwitch}
        value={context.state[key]}
      />
    </View>
  );
}

// TODO: use TextInputProps
function PlainInput(props: ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      // @ts-expect-error add support for clearButtonMode
      clearButtonMode="always"
      style={styles.searchTextInput}
      underlineColorAndroid="transparent"
      {...props}
    />
  );
}

type State = {
  data: Array<Item>;
  debug: boolean;
  horizontal: boolean;
  inverted: boolean;
  filterText: string;
  fixedHeight: boolean;
  logViewable: boolean;
  virtualized: boolean;
};

class SingleColumnExample extends PureComponent<object, State> {
  static title = '<FlatList>';
  static description = 'Performant, scrollable list of data.';

  _listRef: FlatList<Item> | null = null;

  state = {
    data: genItemData(100),
    debug: false,
    horizontal: false,
    inverted: false,
    filterText: '',
    fixedHeight: true,
    logViewable: false,
    virtualized: true
  };

  _onChangeFilterText = (filterText: string) => {
    this.setState({ filterText });
  };

  _onChangeScrollToIndex = (text: string) => {
    this._listRef?.scrollToIndex({ viewPosition: 0.5, index: Number(text) });
  };

  _scrollPos = new Animated.Value(0);
  _scrollSinkX = Animated.event(
    [{ nativeEvent: { contentOffset: { x: this._scrollPos } } }],
    {
      useNativeDriver: true
    }
  );
  _scrollSinkY = Animated.event(
    [{ nativeEvent: { contentOffset: { y: this._scrollPos } } }],
    {
      useNativeDriver: true
    }
  );

  componentDidUpdate() {
    this._listRef?.recordInteraction(); // e.g. flipping logViewable switch
  }

  render() {
    const filterRegex = new RegExp(String(this.state.filterText), 'i');
    const filter = (item: Item) =>
      filterRegex.test(item.text) || filterRegex.test(item.title);
    const filteredData = this.state.data.filter(filter);
    return (
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <View style={styles.options}>
            <PlainInput
              onChangeText={this._onChangeFilterText}
              placeholder="Search..."
              value={this.state.filterText}
            />
            <PlainInput
              onChangeText={this._onChangeScrollToIndex}
              placeholder="scrollToIndex..."
            />
          </View>
          <View style={styles.options}>
            {renderSmallSwitchOption(this, 'virtualized')}
            {renderSmallSwitchOption(this, 'horizontal')}
            {renderSmallSwitchOption(this, 'fixedHeight')}
            {renderSmallSwitchOption(this, 'logViewable')}
            {renderSmallSwitchOption(this, 'inverted')}
            {renderSmallSwitchOption(this, 'debug')}
            <Spindicator value={this._scrollPos} />
          </View>
        </View>
        <SeparatorComponent />
        <AnimatedFlatList
          ItemSeparatorComponent={ItemSeparatorComponent}
          // @ts-expect-error
          ListFooterComponent={FooterComponent}
          ListHeaderComponent={<HeaderComponent />}
          contentContainerStyle={styles.list}
          data={filteredData}
          debug={this.state.debug}
          disableVirtualization={!this.state.virtualized}
          getItemLayout={
            this.state.fixedHeight ? this._getItemLayout : undefined
          }
          horizontal={this.state.horizontal}
          inverted={this.state.inverted}
          key={
            (this.state.horizontal ? 'h' : 'v') +
            (this.state.fixedHeight ? 'f' : 'd')
          }
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          // @ts-expect-error add support for legacyImplementation prop
          legacyImplementation={false}
          numColumns={1}
          onEndReached={this._onEndReached}
          onRefresh={this._onRefresh}
          // @ts-expect-error
          onScroll={
            this.state.horizontal ? this._scrollSinkX : this._scrollSinkY
          }
          onViewableItemsChanged={this._onViewableItemsChanged}
          ref={this._captureRef}
          refreshing={false}
          // @ts-expect-error
          renderItem={this._renderItemComponent}
          viewabilityConfig={VIEWABILITY_CONFIG}
        />
      </View>
    );
  }
  _captureRef = (ref: FlatList<Item> | null) => {
    this._listRef = ref;
  };
  _getItemLayout = (data: unknown, index: number) => {
    return getItemLayout(data, index, this.state.horizontal);
  };
  _onEndReached = () => {
    if (this.state.data.length >= 1000) {
      return;
    }
    this.setState((state) => ({
      data: state.data.concat(genItemData(100, state.data.length))
    }));
  };
  _onRefresh = () => console.log('onRefresh: nothing to refresh :P');
  _renderItemComponent = ({
    item,
    separators
  }: {
    item: Item;
    separators: { highlight: () => void; unhighlight: () => void };
  }) => {
    return (
      <ItemComponent
        fixedHeight={this.state.fixedHeight}
        horizontal={this.state.horizontal}
        item={item}
        onHideUnderlay={separators.unhighlight}
        onPress={this._pressItem}
        onShowUnderlay={separators.highlight}
      />
    );
  };
  // This is called when items change viewability by scrolling into or out of
  // the viewable area.
  _onViewableItemsChanged = (info: {
    changed: Array<{
      key: string;
      isViewable: boolean;
      item: unknown;
      index?: number | null;
      section?: unknown;
    }>;
  }) => {
    // Impressions can be logged here
    if (this.state.logViewable) {
      console.log(
        'onViewableItemsChanged: ',
        info.changed.map((v) => ({ ...v, item: '...' }))
      );
    }
  };
  _pressItem = (key: string) => {
    this._listRef?.recordInteraction();
    pressItem(this, key);
  };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgb(239, 239, 244)',
    flex: 1
  },
  list: {
    backgroundColor: 'white'
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  searchRow: {
    padding: 10
  },
  headerFooter: {
    ...HEADER,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerFooterContainer: {
    backgroundColor: 'rgb(239, 239, 244)'
  },
  horizItem: {
    alignSelf: 'flex-start' // Necessary for touch highlight
  },
  item: {
    flex: 1
  },
  itemSeparator: {
    height: SEPARATOR_HEIGHT,
    backgroundColor: 'rgb(200, 199, 204)',
    marginLeft: 60
  },
  option: {
    flexDirection: 'row',
    padding: 8,
    paddingLeft: 0,
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white'
  },
  searchTextInput: {
    backgroundColor: 'white',
    borderColor: '#cccccc',
    borderRadius: 3,
    borderWidth: 1,
    paddingLeft: 8,
    paddingVertical: 0,
    height: 26,
    fontSize: 14,
    flexGrow: 1
  },
  separator: {
    height: SEPARATOR_HEIGHT,
    backgroundColor: 'rgb(200, 199, 204)'
  },
  smallSwitch: {
    top: 1,
    margin: -6,
    transform: 'scale(0.7)'
  },
  stacked: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10
  },
  thumb: {
    width: 50,
    height: 50,
    left: -5
  },
  spindicator: {
    marginLeft: 'auto',
    marginTop: 8,
    width: 2,
    height: 16,
    backgroundColor: 'darkgray'
  },
  stackedText: {
    padding: 4,
    fontSize: 18
  },
  text: {
    flex: 1
  }
});

export default function ListsPage() {
  return (
    <Example title="Lists">
      <SingleColumnExample />
    </Example>
  );
}
