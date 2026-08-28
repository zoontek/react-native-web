/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { Nullable } from '../../types';
import { isLocaleRTL } from './isLocaleRTL';

type Locale = string;
export type WritingDirection = 'ltr' | 'rtl';

type LocaleValue = {
  // Locale writing direction.
  direction: 'auto' | WritingDirection;
  // Locale BCP47 language code: https://www.ietf.org/rfc/bcp/bcp47.txt
  locale: Nullable<Locale>;
};

const LocaleContext = createContext<LocaleValue>({
  direction: 'ltr',
  locale: 'en-US'
});

type Props = LocaleValue & {
  children: ReactNode;
};

export function getLocaleDirection(locale: Locale): WritingDirection {
  return isLocaleRTL(locale) ? 'rtl' : 'ltr';
}

export function LocaleProvider(props: Props): ReactNode {
  const { direction, locale, children } = props;
  const needsContext = direction || locale;

  const value = useMemo(
    () => ({
      direction: locale ? getLocaleDirection(locale) : direction,
      locale
    }),
    [direction, locale]
  );

  return needsContext ? (
    <LocaleContext.Provider children={children} value={value} />
  ) : (
    children
  );
}

export function useLocaleContext(): LocaleValue {
  return useContext(LocaleContext);
}
