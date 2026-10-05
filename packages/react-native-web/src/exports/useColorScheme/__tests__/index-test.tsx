import * as React from 'react';
import { render } from '@testing-library/react';
import Appearance from '../../Appearance';
import useColorScheme from '..';

describe('useColorScheme', () => {
  test('keeps its subscription active across rerenders', () => {
    const remove = jest.fn();
    const addChangeListener = jest
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
