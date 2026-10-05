/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import useAnimatedProps from './useAnimatedProps';
import useMergeRefs from '../Utilities/useMergeRefs';
import View from '../../../exports/View';
import * as React from 'react';

export type AnimatedComponentType<
  Props extends object,
  Instance = unknown
> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<
    Props &
      Readonly<{
        passthroughAnimatedPropExplicitValues?: React.ComponentProps<
          typeof View
        >;
      }>
  > &
    React.RefAttributes<Instance>
>;

/**
 * Experimental implementation of `createAnimatedComponent` that is intended to
 * be compatible with concurrent rendering.
 */
export default function createAnimatedComponent<
  TProps extends object,
  TInstance
>(
  Component: React.ComponentType<TProps>
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TProps> & React.RefAttributes<TInstance>
> {
  return React.forwardRef<TInstance, TProps>((props, forwardedRef) => {
    const [reducedProps, callbackRef] = useAnimatedProps<TProps, TInstance>(
      props as TProps
    );
    const ref = useMergeRefs<TInstance | null>(callbackRef, forwardedRef);

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
  });
}
