/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import type { LayoutEvent, Nullable } from '../../../types';
import type { FocusEvent } from '../Types/CoreEventTypes';
import type {
  CellRendererProps,
  RenderItemProps,
  RenderItemType
} from './VirtualizedListProps';

import View from '../../../exports/View';
import type { ViewProps } from '../../../exports/View';
import StyleSheet from '../../../exports/StyleSheet';
import { VirtualizedListCellContextProvider } from './VirtualizedListContext';
import invariant from 'fbjs/lib/invariant';
import {
  Component,
  createElement,
  isValidElement,
  type ComponentType,
  type ReactElement,
  type ReactNode
} from 'react';

type ViewStyleProp = ViewProps['style'];

export type Props<ItemT> = {
  CellRendererComponent?: Nullable<ComponentType<CellRendererProps<ItemT>>>;
  ItemSeparatorComponent: Nullable<
    ComponentType<{ highlighted: boolean; leadingItem: Nullable<ItemT> }>
  >;
  ListItemComponent?: Nullable<ComponentType<unknown> | ReactElement<unknown>>;
  cellKey: string;
  horizontal: Nullable<boolean>;
  index: number;
  inversionStyle: ViewStyleProp;
  item: ItemT;
  onCellLayout?: (event: LayoutEvent, cellKey: string, index: number) => void;
  onCellFocusCapture?: (event: FocusEvent) => void;
  onUnmount: (cellKey: string) => void;
  onUpdateSeparators: (
    cellKeys: Array<Nullable<string>>,
    props: Partial<SeparatorProps<ItemT>>
  ) => void;
  prevCellKey: Nullable<string>;
  renderItem?: Nullable<RenderItemType<ItemT>>;
};

type SeparatorProps<ItemT> = Readonly<{
  highlighted: boolean;
  leadingItem: Nullable<ItemT>;
}>;

type State<ItemT> = {
  separatorProps: SeparatorProps<ItemT>;
};

export default class CellRenderer<ItemT> extends Component<
  Props<ItemT>,
  State<ItemT>
> {
  state: State<ItemT> = {
    separatorProps: {
      highlighted: false,
      leadingItem: this.props.item
    }
  };

  static getDerivedStateFromProps<ItemT>(
    props: Props<ItemT>,
    prevState: State<ItemT>
  ): Nullable<State<ItemT>> {
    return {
      separatorProps: {
        ...prevState.separatorProps,
        leadingItem: props.item
      }
    };
  }

  // TODO: consider factoring separator stuff out of VirtualizedList into FlatList since it's not
  // reused by SectionList and we can keep VirtualizedList simpler.
  _separators = {
    highlight: () => {
      const { cellKey, prevCellKey } = this.props;
      this.props.onUpdateSeparators([cellKey, prevCellKey], {
        highlighted: true
      });
    },
    unhighlight: () => {
      const { cellKey, prevCellKey } = this.props;
      this.props.onUpdateSeparators([cellKey, prevCellKey], {
        highlighted: false
      });
    },
    updateProps: (select: 'leading' | 'trailing', newProps: unknown) => {
      const { cellKey, prevCellKey } = this.props;
      this.props.onUpdateSeparators(
        [select === 'leading' ? prevCellKey : cellKey],
        newProps as Partial<SeparatorProps<ItemT>>
      );
    }
  };

  updateSeparatorProps(newProps: Partial<SeparatorProps<ItemT>>) {
    this.setState((state) => ({
      separatorProps: { ...state.separatorProps, ...newProps }
    }));
  }

  componentWillUnmount() {
    this.props.onUnmount(this.props.cellKey);
  }

  _onLayout = (nativeEvent: LayoutEvent): void => {
    this.props.onCellLayout &&
      this.props.onCellLayout(
        nativeEvent,
        this.props.cellKey,
        this.props.index
      );
  };

  _renderElement(
    renderItem: Nullable<RenderItemType<ItemT>>,
    ListItemComponent: unknown,
    item: ItemT,
    index: number
  ): ReactNode {
    if (renderItem && ListItemComponent) {
      console.warn(
        'VirtualizedList: Both ListItemComponent and renderItem props are present. ListItemComponent will take' +
          ' precedence over renderItem.'
      );
    }

    if (ListItemComponent) {
      return createElement(
        ListItemComponent as ComponentType<RenderItemProps<ItemT>>,
        {
          item,
          index,
          separators: this._separators
        }
      );
    }

    if (renderItem) {
      return renderItem({
        item,
        index,
        separators: this._separators
      });
    }

    invariant(
      false,
      'VirtualizedList: Either ListItemComponent or renderItem props are required but none were found.'
    );
  }

  render(): ReactNode {
    const {
      CellRendererComponent,
      ItemSeparatorComponent,
      ListItemComponent,
      cellKey,
      horizontal,
      item,
      index,
      inversionStyle,
      onCellFocusCapture,
      onCellLayout,
      renderItem
    } = this.props;
    const element = this._renderElement(
      renderItem,
      ListItemComponent,
      item,
      index
    );

    // NOTE: that when this is a sticky header, `onLayout` will get automatically extracted and
    // called explicitly by `ScrollViewStickyHeader`.
    const itemSeparator: ReactNode = isValidElement(ItemSeparatorComponent)
      ? ItemSeparatorComponent
      : ItemSeparatorComponent && (
          <ItemSeparatorComponent {...this.state.separatorProps} />
        );
    const cellStyle = inversionStyle
      ? horizontal
        ? [styles.rowReverse, inversionStyle]
        : [styles.columnReverse, inversionStyle]
      : horizontal
        ? [styles.row, inversionStyle]
        : inversionStyle;
    const result = !CellRendererComponent ? (
      <View
        style={cellStyle}
        {...({
          onFocusCapture: onCellFocusCapture
        } as unknown as Partial<ViewProps>)}
        {...(onCellLayout && { onLayout: this._onLayout })}
      >
        {element}
        {itemSeparator}
      </View>
    ) : (
      <CellRendererComponent
        cellKey={cellKey}
        index={index}
        item={item}
        style={cellStyle}
        onFocusCapture={onCellFocusCapture}
        {...(onCellLayout && { onLayout: this._onLayout })}
      >
        {element}
        {itemSeparator}
      </CellRendererComponent>
    );

    return (
      <VirtualizedListCellContextProvider cellKey={this.props.cellKey}>
        {result}
      </VirtualizedListCellContextProvider>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row'
  },
  rowReverse: {
    flexDirection: 'row-reverse'
  },
  columnReverse: {
    flexDirection: 'column-reverse'
  }
});
