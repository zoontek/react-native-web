import { render } from '@testing-library/react';
import * as React from 'react';

import useColorScheme from '..';
import Appearance from '../../Appearance';

describe('useColorScheme', () => {
  test('keeps its subscription active across rerenders', () => {
    const remove = vi.fn();
    const addChangeListener = vi
      .spyOn(Appearance, 'addChangeListener')
      .mockReturnValue({ remove });

    function Component({ label }: { label: string }): React.ReactNode {
      const colorScheme = useColorScheme();
      return <div>{`${label}:${colorScheme}`}</div>;
    }

    const { rerender, unmount } = render(<Component label="first" />);
    expect(addChangeListener).toHaveBeenCalledTimes(1);
    expect(remove).not.toHaveBeenCalled();

    rerender(<Component label="second" />);
    expect(addChangeListener).toHaveBeenCalledTimes(1);
    expect(remove).not.toHaveBeenCalled();

    unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
