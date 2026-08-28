/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createContext,
  type ComponentType,
  type ReactNode,
  type Ref
} from 'react';

import type { Nullable, PlatformMethods } from '../../types';
import StyleSheet from '../StyleSheet';
import View from '../View';

type Props = {
  WrapperComponent?: Nullable<ComponentType<{ children?: ReactNode }>>;
  children?: ReactNode;
  ref?: Ref<HTMLElement & PlatformMethods>;
  rootTag: unknown;
};

const RootTagContext = createContext<unknown>(null);

const AppContainer = (props: Props) => {
  const { children, ref, WrapperComponent } = props;

  let innerView = (
    <View children={children} key={1} style={styles.appContainer} />
  );

  if (WrapperComponent) {
    innerView = <WrapperComponent>{innerView}</WrapperComponent>;
  }

  return (
    <RootTagContext.Provider value={props.rootTag}>
      <View ref={ref} style={styles.appContainer}>
        {innerView}
      </View>
    </RootTagContext.Provider>
  );
};

AppContainer.displayName = 'AppContainer';

export default AppContainer;

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    pointerEvents: 'box-none'
  }
});
