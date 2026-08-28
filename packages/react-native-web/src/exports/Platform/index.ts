/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Platform = {
  OS: 'web',
  select: <T>(obj: Record<string, T | undefined>): T | undefined =>
    'web' in obj ? obj.web : obj.default,
  get isTesting(): boolean {
    return process.env.NODE_ENV === 'test';
  },
  get Version(): string {
    return '0.0.0';
  }
};

export default Platform;
