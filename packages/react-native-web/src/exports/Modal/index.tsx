/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import type { ReactNode } from 'react';
import type { Nullable, PlatformMethods } from '../../types';
import type { ViewProps } from '../View';

import * as React from 'react';
import ModalPortal from './ModalPortal';
import ModalAnimation from './ModalAnimation';
import ModalContent from './ModalContent';
import ModalFocusTrap from './ModalFocusTrap';

export type ModalProps = ViewProps & {
  animationType?: 'none' | 'slide' | 'fade';
  children?: ReactNode;
  hardwareAccelerated?: Nullable<boolean>;
  onDismiss?: Nullable<() => unknown>;
  onOrientationChange?: Nullable<
    (e: { orientation: 'portrait' | 'landscape' }) => void
  >;
  onRequestClose?: Nullable<() => void>;
  onShow?: Nullable<() => void>;
  presentationStyle?: Nullable<
    'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen'
  >;
  statusBarTranslucent?: Nullable<boolean>;
  supportedOrientations?: Nullable<
    Array<
      | 'portrait'
      | 'portrait-upside-down'
      | 'landscape'
      | 'landscape-left'
      | 'landscape-right'
    >
  >;
  transparent?: Nullable<boolean>;
  visible?: Nullable<boolean>;
};

let uniqueModalIdentifier = 0;

const activeModalStack: Array<number> = [];
const activeModalListeners: Record<number, (isActive: boolean) => void> = {};

function notifyActiveModalListeners() {
  if (activeModalStack.length === 0) {
    return;
  }
  const activeModalId = activeModalStack[activeModalStack.length - 1];
  activeModalStack.forEach((modalId) => {
    if (modalId in activeModalListeners) {
      activeModalListeners[modalId]?.(modalId === activeModalId);
    }
  });
}

function removeActiveModal(modalId: number) {
  if (modalId in activeModalListeners) {
    // Before removing this listener we should probably tell it
    // that it's no longer the active modal for sure.
    activeModalListeners[modalId]?.(false);
    delete activeModalListeners[modalId];
  }
  const index = activeModalStack.indexOf(modalId);
  if (index !== -1) {
    activeModalStack.splice(index, 1);
    notifyActiveModalListeners();
  }
}

function addActiveModal(
  modalId: number,
  listener: (isActive: boolean) => void
) {
  removeActiveModal(modalId);
  activeModalStack.push(modalId);
  activeModalListeners[modalId] = listener;
  notifyActiveModalListeners();
}

// TODO: remove the alias after forwardRef removal
type TNode = HTMLElement & PlatformMethods;

const Modal = React.forwardRef<TNode, ModalProps>((props, forwardedRef) => {
  const {
    animationType,
    children,
    onDismiss,
    onRequestClose,
    onShow,
    transparent,
    visible = true,
    ...rest
  } = props;

  // Set a unique model identifier so we can correctly route
  // dismissals and check the layering of modals.
  const modalId = React.useMemo(() => uniqueModalIdentifier++, []);

  const [isActive, setIsActive] = React.useState(false);

  const onDismissCallback = React.useCallback(() => {
    removeActiveModal(modalId);
    if (onDismiss) {
      onDismiss();
    }
  }, [modalId, onDismiss]);

  const onShowCallback = React.useCallback(() => {
    addActiveModal(modalId, setIsActive);
    if (onShow) {
      onShow();
    }
  }, [modalId, onShow]);

  React.useEffect(() => {
    return () => removeActiveModal(modalId);
  }, [modalId]);

  return (
    <ModalPortal>
      <ModalAnimation
        animationType={animationType}
        onDismiss={onDismissCallback}
        onShow={onShowCallback}
        visible={visible}
      >
        <ModalFocusTrap active={isActive}>
          <ModalContent
            {...rest}
            active={isActive}
            onRequestClose={onRequestClose}
            ref={forwardedRef}
            transparent={transparent}
          >
            {children}
          </ModalContent>
        </ModalFocusTrap>
      </ModalAnimation>
    </ModalPortal>
  );
});

export default Modal;
