/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useMemo, type ReactNode, type Ref } from 'react';

import canUseDOM from '../../modules/canUseDom';
import type { Nullable, PlatformMethods } from '../../types';
import StyleSheet from '../StyleSheet';
import View, { type ViewProps } from '../View';

export type ModalContentProps = ViewProps & {
  active?: Nullable<boolean | (() => boolean)>;
  children?: ReactNode;
  onRequestClose?: Nullable<() => void>;
  ref?: Ref<HTMLElement & PlatformMethods>;
  transparent?: Nullable<boolean>;
};

const ModalContent = (props: ModalContentProps) => {
  const { active, children, onRequestClose, ref, transparent, ...rest } = props;

  useEffect(() => {
    if (canUseDOM) {
      const closeOnEscape = (e: KeyboardEvent) => {
        if (active && e.key === 'Escape') {
          e.stopPropagation();
          if (onRequestClose) {
            onRequestClose();
          }
        }
      };
      document.addEventListener('keyup', closeOnEscape, false);
      return () => document.removeEventListener('keyup', closeOnEscape, false);
    }
  }, [active, onRequestClose]);

  const style = useMemo(() => {
    return [
      styles.modal,
      transparent ? styles.modalTransparent : styles.modalOpaque
    ];
  }, [transparent]);

  return (
    <View
      {...rest}
      aria-modal={true}
      ref={ref}
      role={active ? 'dialog' : null}
      style={style}
    >
      <View style={styles.container}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  modalTransparent: {
    backgroundColor: 'transparent'
  },
  modalOpaque: {
    backgroundColor: 'white'
  },
  container: {
    top: 0,
    flex: 1
  }
});

export default ModalContent;
