/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import type {
  ComponentProps,
  ComponentType,
  PropsWithoutRef,
  ReactNode,
  Ref
} from 'react';

import View from '../../../exports/View';
import useMergeRefs from '../Utilities/useMergeRefs';
import useAnimatedProps from './useAnimatedProps';

export type AnimatedComponentType<Props extends object, Instance = unknown> = (
  props: PropsWithoutRef<
    Props &
      Readonly<{
        passthroughAnimatedPropExplicitValues?: ComponentProps<typeof View>;
      }>
  > & { ref?: Ref<Instance> }
) => ReactNode;

/**
 * Experimental implementation of `createAnimatedComponent` that is intended to
 * be compatible with concurrent rendering.
 */
export default function createAnimatedComponent<
  TProps extends object,
  TInstance
>(
  Component: ComponentType<TProps>
): (props: PropsWithoutRef<TProps> & { ref?: Ref<TInstance> }) => ReactNode {
  return (props) => {
    const [reducedProps, callbackRef] = useAnimatedProps<TProps, TInstance>(
      props as TProps
    );
    const ref = useMergeRefs<TInstance | null>(callbackRef, props.ref);

    // Some components require explicit passthrough values for animation
    // to work properly. For example, if an animated component is
    // transformed and Pressable, onPress will not work after transform
    // without these passthrough values.
    const { passthroughAnimatedPropExplicitValues, style } =
      reducedProps as TProps & {
        collapsable: boolean;
        passthroughAnimatedPropExplicitValues?: Record<string, unknown>;
        style?: unknown;
      };
    const { style: passthroughStyle, ...passthroughProps } =
      passthroughAnimatedPropExplicitValues ?? {};
    const mergedStyle = [style, passthroughStyle];

    return (
      <Component
        {...(reducedProps as TProps)}
        {...(passthroughProps as Partial<TProps>)}
        {...({ style: mergedStyle, ref } as unknown as Partial<TProps>)}
      />
    );
  };
}
