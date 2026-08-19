/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import type { Context } from 'react';
import { createContext } from 'react';

const TextAncestorContext: Context<boolean> = createContext(false);
export default TextAncestorContext;
