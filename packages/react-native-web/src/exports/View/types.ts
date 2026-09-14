/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  TouchEvent,
  UIEvent,
  WheelEvent
} from 'react';

import type {
  ColorValue,
  GenericStyleProp,
  LayoutEvent,
  Nullable
} from '../../types';

import type {
  AnimationStyles,
  BorderStyles,
  InteractionStyles,
  LayoutStyles,
  ShadowStyles,
  TransformStyles
} from '../../types/styles';

import type { ResponderEvent } from '../../modules/useResponderEvents/createResponderEvent';

type NumberOrString = number | string;
type OverscrollBehaviorValue = 'auto' | 'contain' | 'none';
type idRef = string;
type idRefList = idRef | Array<idRef>;

export type AccessibilityProps = {
  'aria-activedescendant'?: Nullable<idRef>;
  'aria-atomic'?: Nullable<boolean>;
  'aria-autocomplete'?: Nullable<'none' | 'list' | 'inline' | 'both'>;
  'aria-busy'?: Nullable<boolean>;
  'aria-checked'?: Nullable<boolean | 'mixed'>;
  'aria-colcount'?: Nullable<number>;
  'aria-colindex'?: Nullable<number>;
  'aria-colspan'?: Nullable<number>;
  'aria-controls'?: Nullable<idRef>;
  'aria-current'?: Nullable<
    boolean | 'page' | 'step' | 'location' | 'date' | 'time'
  >;
  'aria-describedby'?: Nullable<idRef>;
  'aria-details'?: Nullable<idRef>;
  'aria-disabled'?: Nullable<boolean>;
  'aria-errormessage'?: Nullable<idRef>;
  'aria-expanded'?: Nullable<boolean>;
  'aria-flowto'?: Nullable<idRef>;
  'aria-haspopup'?: Nullable<
    'dialog' | 'grid' | 'listbox' | 'menu' | 'tree' | false
  >;
  'aria-hidden'?: Nullable<boolean>;
  'aria-invalid'?: Nullable<boolean>;
  'aria-keyshortcuts'?: Nullable<Array<string>>;
  'aria-label'?: Nullable<string>;
  'aria-labelledby'?: Nullable<idRef>;
  'aria-level'?: Nullable<number>;
  'aria-live'?: Nullable<'assertive' | 'none' | 'polite'>;
  'aria-modal'?: Nullable<boolean>;
  'aria-multiline'?: Nullable<boolean>;
  'aria-multiselectable'?: Nullable<boolean>;
  'aria-orientation'?: Nullable<'horizontal' | 'vertical'>;
  'aria-owns'?: Nullable<idRef>;
  'aria-placeholder'?: Nullable<string>;
  'aria-posinset'?: Nullable<number>;
  'aria-pressed'?: Nullable<boolean | 'mixed'>;
  'aria-readonly'?: Nullable<boolean>;
  'aria-required'?: Nullable<boolean>;
  'aria-roledescription'?: Nullable<string>;
  'aria-rowcount'?: Nullable<number>;
  'aria-rowindex'?: Nullable<number>;
  'aria-rowspan'?: Nullable<number>;
  'aria-selected'?: Nullable<boolean>;
  'aria-setsize'?: Nullable<number>;
  'aria-sort'?: Nullable<'ascending' | 'descending' | 'none' | 'other'>;
  'aria-valuemax'?: Nullable<number>;
  'aria-valuemin'?: Nullable<number>;
  'aria-valuenow'?: Nullable<number>;
  'aria-valuetext'?: Nullable<string>;
  role?: Nullable<string>;

  // @deprecated
  accessibilityActiveDescendant?: Nullable<idRef>;
  accessibilityAtomic?: Nullable<boolean>;
  accessibilityAutoComplete?: Nullable<'none' | 'list' | 'inline' | 'both'>;
  accessibilityBusy?: Nullable<boolean>;
  accessibilityChecked?: Nullable<boolean | 'mixed'>;
  accessibilityColumnCount?: Nullable<number>;
  accessibilityColumnIndex?: Nullable<number>;
  accessibilityColumnSpan?: Nullable<number>;
  accessibilityControls?: Nullable<idRefList>;
  accessibilityCurrent?: Nullable<
    boolean | 'page' | 'step' | 'location' | 'date' | 'time'
  >;
  accessibilityDescribedBy?: Nullable<idRefList>;
  accessibilityDetails?: Nullable<idRef>;
  accessibilityDisabled?: Nullable<boolean>;
  accessibilityErrorMessage?: Nullable<idRef>;
  accessibilityExpanded?: Nullable<boolean>;
  accessibilityFlowTo?: Nullable<idRefList>;
  accessibilityHasPopup?: Nullable<
    'dialog' | 'grid' | 'listbox' | 'menu' | 'tree' | false
  >;
  accessibilityHidden?: Nullable<boolean>;
  accessibilityInvalid?: Nullable<boolean>;
  accessibilityKeyShortcuts?: Nullable<Array<string>>;
  accessibilityLabel?: Nullable<string>;
  accessibilityLabelledBy?: Nullable<idRefList>;
  accessibilityLevel?: Nullable<number>;
  accessibilityLiveRegion?: Nullable<'assertive' | 'none' | 'polite'>;
  accessibilityModal?: Nullable<boolean>;
  accessibilityMultiline?: Nullable<boolean>;
  accessibilityMultiSelectable?: Nullable<boolean>;
  accessibilityOrientation?: Nullable<'horizontal' | 'vertical'>;
  accessibilityOwns?: Nullable<idRefList>;
  accessibilityPlaceholder?: Nullable<string>;
  accessibilityPosInSet?: Nullable<number>;
  accessibilityPressed?: Nullable<boolean | 'mixed'>;
  accessibilityReadOnly?: Nullable<boolean>;
  accessibilityRequired?: Nullable<boolean>;
  accessibilityRole?: Nullable<string>;
  accessibilityRoleDescription?: Nullable<string>;
  accessibilityRowCount?: Nullable<number>;
  accessibilityRowIndex?: Nullable<number>;
  accessibilityRowSpan?: Nullable<number>;
  accessibilitySelected?: Nullable<boolean>;
  accessibilitySetSize?: Nullable<number>;
  accessibilitySort?: Nullable<'ascending' | 'descending' | 'none' | 'other'>;
  accessibilityValueMax?: Nullable<number>;
  accessibilityValueMin?: Nullable<number>;
  accessibilityValueNow?: Nullable<number>;
  accessibilityValueText?: Nullable<string>;
};

export type EventProps = {
  onAuxClick?: (e: MouseEvent<HTMLElement>) => void;
  onBlur?: (e: FocusEvent<HTMLElement>) => void;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onContextMenu?: (e: MouseEvent<HTMLElement>) => void;
  onFocus?: (e: FocusEvent<HTMLElement>) => void;
  onGotPointerCapture?: (e: PointerEvent<HTMLElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
  onKeyUp?: (e: KeyboardEvent<HTMLElement>) => void;
  onLayout?: (e: LayoutEvent) => void;
  onLostPointerCapture?: (e: PointerEvent<HTMLElement>) => void;
  onMoveShouldSetResponder?: (e: ResponderEvent) => boolean;
  onMoveShouldSetResponderCapture?: (e: ResponderEvent) => boolean;
  onPointerCancel?: (e: PointerEvent<HTMLElement>) => void;
  onPointerDown?: (e: PointerEvent<HTMLElement>) => void;
  onPointerEnter?: (e: PointerEvent<HTMLElement>) => void;
  onPointerMove?: (e: PointerEvent<HTMLElement>) => void;
  onPointerLeave?: (e: PointerEvent<HTMLElement>) => void;
  onPointerOut?: (e: PointerEvent<HTMLElement>) => void;
  onPointerOver?: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp?: (e: PointerEvent<HTMLElement>) => void;
  onResponderEnd?: (e: ResponderEvent) => void;
  onResponderGrant?: (e: ResponderEvent) => void;
  onResponderMove?: (e: ResponderEvent) => void;
  onResponderReject?: (e: ResponderEvent) => void;
  onResponderRelease?: (e: ResponderEvent) => void;
  onResponderStart?: (e: ResponderEvent) => void;
  onResponderTerminate?: (e: ResponderEvent) => void;
  onResponderTerminationRequest?: (e: ResponderEvent) => boolean;
  onScrollShouldSetResponder?: (e: ResponderEvent) => boolean;
  onScrollShouldSetResponderCapture?: (e: ResponderEvent) => boolean;
  onSelectionChangeShouldSetResponder?: (e: ResponderEvent) => boolean;
  onSelectionChangeShouldSetResponderCapture?: (e: ResponderEvent) => boolean;
  onStartShouldSetResponder?: (e: ResponderEvent) => boolean;
  onStartShouldSetResponderCapture?: (e: ResponderEvent) => boolean;
  // unstable
  onMouseDown?: (e: MouseEvent<HTMLElement>) => void;
  onMouseEnter?: (e: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLElement>) => void;
  onMouseMove?: (e: MouseEvent<HTMLElement>) => void;
  onMouseOver?: (e: MouseEvent<HTMLElement>) => void;
  onMouseOut?: (e: MouseEvent<HTMLElement>) => void;
  onMouseUp?: (e: MouseEvent<HTMLElement>) => void;
  onScroll?: (e: UIEvent<HTMLElement>) => void;
  onTouchCancel?: (e: TouchEvent<HTMLElement>) => void;
  onTouchCancelCapture?: (e: TouchEvent<HTMLElement>) => void;
  onTouchEnd?: (e: TouchEvent<HTMLElement>) => void;
  onTouchEndCapture?: (e: TouchEvent<HTMLElement>) => void;
  onTouchMove?: (e: TouchEvent<HTMLElement>) => void;
  onTouchMoveCapture?: (e: TouchEvent<HTMLElement>) => void;
  onTouchStart?: (e: TouchEvent<HTMLElement>) => void;
  onTouchStartCapture?: (e: TouchEvent<HTMLElement>) => void;
  onWheel?: (e: WheelEvent<HTMLElement>) => void;
};

export type ViewStyle = AnimationStyles &
  BorderStyles &
  InteractionStyles &
  LayoutStyles &
  ShadowStyles &
  TransformStyles & {
    backdropFilter?: Nullable<string>;
    backgroundAttachment?: Nullable<string>;
    backgroundBlendMode?: Nullable<string>;
    backgroundClip?: Nullable<string>;
    backgroundColor?: Nullable<ColorValue>;
    backgroundImage?: Nullable<string>;
    backgroundOrigin?: 'border-box' | 'content-box' | 'padding-box';
    backgroundPosition?: Nullable<string>;
    backgroundRepeat?: Nullable<string>;
    backgroundSize?: Nullable<string>;
    boxShadow?: Nullable<string>;
    clip?: Nullable<string>;
    filter?: Nullable<string>;
    opacity?: Nullable<number>;
    outlineColor?: Nullable<ColorValue>;
    outlineOffset?: Nullable<NumberOrString>;
    outlineStyle?: Nullable<string>;
    outlineWidth?: Nullable<NumberOrString>;
    overscrollBehavior?: Nullable<OverscrollBehaviorValue>;
    overscrollBehaviorX?: Nullable<OverscrollBehaviorValue>;
    overscrollBehaviorY?: Nullable<OverscrollBehaviorValue>;
    pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
    scrollbarWidth?: 'auto' | 'none' | 'thin';
    scrollSnapAlign?: Nullable<string>;
    scrollSnapType?: Nullable<string>;
    WebkitMaskImage?: Nullable<string>;
    WebkitOverflowScrolling?: 'auto' | 'touch';
  };

export type ViewProps = AccessibilityProps &
  EventProps & {
    children?: Nullable<ReactNode>;
    dataSet?: Record<string, unknown>;
    dir?: 'ltr' | 'rtl';
    id?: Nullable<string>;
    lang?: string;
    style?: GenericStyleProp<ViewStyle>;
    tabIndex?: Nullable<0 | -1>;
    testID?: Nullable<string>;
    // unstable
    href?: Nullable<string>;
    hrefAttrs?: Nullable<{
      download?: Nullable<boolean | string>;
      rel?: Nullable<string>;
      target?: Nullable<string>;
    }>;
    // @deprecated
    focusable?: Nullable<boolean>;
    pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
    nativeID?: Nullable<string>;
  };
