/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ReactDOMServer from 'react-dom/server';
import { addEventListener } from '..';
import { createRef, useEffect } from 'react';

describe('addEventListener', () => {
  test('can render correctly using ReactDOMServer', () => {
    const listener = jest.fn();
    const targetRef = createRef<HTMLDivElement>();

    function Component() {
      useEffect(() => {
        if (targetRef.current != null) {
          return addEventListener(targetRef.current, 'click', listener);
        }
      });
      return <div ref={targetRef} />;
    }

    const output = ReactDOMServer.renderToString(<Component />);
    expect(output).toBe('<div></div>');
  });
});
