/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fireEvent, render } from '@testing-library/react';
import { useEffect } from 'react';

import Modal from '..';

describe('components/Modal', () => {
  test('visible by default', () => {
    const { getByTestId } = render(
      <Modal>
        <a data-testid={'inside'} href={'#hello'}>
          Hello
        </a>
      </Modal>
    );
    const insideElement = getByTestId('inside');
    expect(insideElement).not.toBeNull();
    expect(insideElement).not.toBe(document.body);
  });

  test('forwards props', () => {
    const { getByTestId } = render(
      <Modal
        accessibilityLabel="label"
        accessibilityLabelledBy="labelledby"
        testID="root"
      />
    );
    expect(getByTestId('root')).toMatchSnapshot();
  });

  test('render children when visible', () => {
    const { getByTestId } = render(
      <Modal visible={true}>
        <a data-testid={'inside'} href={'#hello'}>
          Hello
        </a>
      </Modal>
    );
    const insideElement = getByTestId('inside');
    expect(insideElement).not.toBeNull();
    expect(insideElement).not.toBe(document.body);
  });

  test('does not render children when not visible', () => {
    const { container } = render(
      <Modal visible={false}>
        <a data-testid={'inside'} href={'#hello'}>
          Hello
        </a>
      </Modal>
    );
    expect(container.children.length).toBe(0);
  });

  test('invisible modals will not be the active modal', () => {
    const { getByTestId } = render(
      <>
        <Modal key={'modal-a'} visible={true}>
          <a data-testid={'inside-a'} href={'#hello'}>
            Hello
          </a>
        </Modal>
        <Modal key={'modal-b'} visible={false}>
          <a data-testid={'inside-b'} href={'#hello'}>
            Hello
          </a>
        </Modal>
      </>
    );
    const insideElement = getByTestId('inside-a');
    const dialogElements = document.body.querySelectorAll('[role=dialog]');
    expect(dialogElements.length).toBe(1);
    expect(dialogElements[0]?.contains(insideElement)).toBeTruthy();
  });

  test('multiple modals will only mark one as active', () => {
    const { getByTestId } = render(
      <>
        <Modal key={'modal-a'} visible={true}>
          <a data-testid={'inside-a'} href={'#hello'}>
            Hello
          </a>
        </Modal>
        <Modal key={'modal-b'} visible={true}>
          <a data-testid={'inside-b'} href={'#hello'}>
            Hello
          </a>
        </Modal>
      </>
    );
    const insideElement = getByTestId('inside-b');
    const dialogElements = document.body.querySelectorAll('[role=dialog]');
    expect(dialogElements.length).toBe(1);
    expect(dialogElements[0]?.contains(insideElement)).toBeTruthy();
  });

  test('modal active state changes propogate', () => {
    const { rerender, getByTestId } = render(
      <>
        <Modal key={'modal-a'} visible={true}>
          <a data-testid={'inside-a'} href={'#hello'}>
            Hello
          </a>
        </Modal>
        <Modal key={'modal-b'} visible={false}>
          <a data-testid={'inside-b'} href={'#hello'}>
            Hello
          </a>
        </Modal>
      </>
    );

    rerender(
      <>
        <Modal key={'modal-a'} visible={true}>
          <a data-testid={'inside-a'} href={'#hello'}>
            Hello
          </a>
        </Modal>
        <Modal key={'modal-b'} visible={true}>
          <a data-testid={'inside-b'} href={'#hello'}>
            Hello
          </a>
        </Modal>
      </>
    );

    const insideElement = getByTestId('inside-b');
    const dialogElements = document.body.querySelectorAll('[role=dialog]');
    expect(dialogElements.length).toBe(1);
    expect(dialogElements[0]?.contains(insideElement)).toBeTruthy();
  });

  test('removed modal sets others active state', () => {
    const { rerender, getByTestId } = render(
      <>
        <Modal key={'modal-a'} visible={true}>
          <a data-testid={'inside-a'} href={'#hello'}>
            Hello
          </a>
        </Modal>
        <Modal key={'modal-b'} visible={true}>
          <a data-testid={'inside-b'} href={'#hello'}>
            Hello
          </a>
        </Modal>
      </>
    );

    rerender(
      <Modal key={'modal-a'} visible={true}>
        <a data-testid={'inside-a'} href={'#hello'}>
          Hello
        </a>
      </Modal>
    );

    const insideElement = getByTestId('inside-a');
    const dialogElements = document.body.querySelectorAll('[role=dialog]');
    expect(dialogElements.length).toBe(1);
    expect(dialogElements[0]?.contains(insideElement)).toBeTruthy();
  });

  test('executes onShow callback when initially showing', () => {
    const onShowCallback = vi.fn();
    render(<Modal onShow={onShowCallback} visible={true} />);
    expect(onShowCallback).toHaveBeenCalledTimes(1);
  });

  test('does not execute onShow callback when initially hidden', () => {
    const onShowCallback = vi.fn();
    render(<Modal onShow={onShowCallback} visible={false} />);
    expect(onShowCallback).toHaveBeenCalledTimes(0);
  });

  test('does not execute onDismiss callback when initially hidden', () => {
    const onDismissCallback = vi.fn();
    render(<Modal onDismiss={onDismissCallback} visible={false} />);
    expect(onDismissCallback).toHaveBeenCalledTimes(0);
  });

  test('does not execute onDismiss callback when initially showing', () => {
    const onDismissCallback = vi.fn();
    render(<Modal onDismiss={onDismissCallback} visible={true} />);
    expect(onDismissCallback).toHaveBeenCalledTimes(0);
  });

  test('executes onShow callback when visibility changes', () => {
    const onShowCallback = vi.fn();
    const { rerender } = render(
      <Modal onShow={onShowCallback} visible={false} />
    );
    expect(onShowCallback).toHaveBeenCalledTimes(0);
    rerender(<Modal onShow={onShowCallback} visible={true} />);
    expect(onShowCallback).toHaveBeenCalledTimes(1);
  });

  test('executes onDismiss callback when visibility changes', () => {
    const onDismissCallback = vi.fn();
    const { rerender } = render(
      <Modal onDismiss={onDismissCallback} visible={true} />
    );
    expect(onDismissCallback).toHaveBeenCalledTimes(0);
    rerender(<Modal onDismiss={onDismissCallback} visible={false} />);
    expect(onDismissCallback).toHaveBeenCalledTimes(1);
  });

  test('animationTypes none is the same as omitting', () => {
    const { rerender, baseElement } = render(
      <Modal animationType={'none'} visible={true} />
    );
    const animationNoneElement = baseElement.lastChild?.lastChild as Element;
    const animationNoneStyle = window.getComputedStyle(
      animationNoneElement,
      null
    );
    rerender(<Modal visible={true} />);
    const animationMissingElement = baseElement.lastChild?.lastChild as Element;
    const animationMissingStyle = window.getComputedStyle(
      animationMissingElement,
      null
    );
    const styleProps = new Set<string>();

    for (let i = 0; i < animationNoneStyle.length; i++) {
      const value = animationNoneStyle[i];
      if (value != null) {
        styleProps.add(value);
      }
    }

    for (let i = 0; i < animationMissingStyle.length; i++) {
      const value = animationMissingStyle[i];
      if (value != null) {
        styleProps.add(value);
      }
    }

    for (const prop of styleProps) {
      expect(animationNoneStyle[prop as keyof CSSStyleDeclaration]).toEqual(
        animationMissingStyle[prop as keyof CSSStyleDeclaration]
      );
    }
  });

  test('creates view with role="dialog" when active', () => {
    const { baseElement } = render(
      <Modal visible={true}>
        <a href={'#hello'}>Hello</a>
      </Modal>
    );
    const dialogElement = (
      baseElement.lastChild as Element
    ).querySelector<HTMLElement>('[role="dialog"]');
    expect(dialogElement).not.toBeNull();
    expect(dialogElement?.getAttribute('role')).toBe('dialog');
    expect(dialogElement?.getAttribute('aria-modal')).toBe('true');
  });

  test('focus is trapped by default', () => {
    render(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal>
          <a data-testid={'inside'} href={'#hello'}>
            Hello
          </a>
        </Modal>
      </>
    );

    const outsideElement = document.querySelector<HTMLElement>(
      '[data-testid="outside"]'
    );
    const insideElement = document.querySelector<HTMLElement>(
      '[data-testid="inside"]'
    );
    outsideElement?.focus();
    expect(document.activeElement).toBe(insideElement);
  });

  test('focus is trapped when active flag changes', () => {
    const { rerender } = render(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal visible={false}>
          <a data-testid={'inside'} href={'#hello'}>
            Hello
          </a>
        </Modal>
      </>
    );

    const outsideElement = document.querySelector<HTMLElement>(
      '[data-testid="outside"]'
    );
    outsideElement?.focus();
    expect(document.activeElement).toBe(outsideElement);

    rerender(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal visible={true}>
          <a data-testid={'inside'} href={'#hello'}>
            Hello
          </a>
        </Modal>
      </>
    );

    const insideElement = document.querySelector<HTMLElement>(
      '[data-testid="inside"]'
    );

    expect(document.activeElement).toBe(insideElement);
  });

  test('focus is not trapped after closing modal', () => {
    const { rerender } = render(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal visible={true} />
      </>
    );

    const outsideElement = document.querySelector<HTMLElement>(
      '[data-testid="outside"]'
    );
    const onDismissCallback = vi.fn(() => outsideElement?.focus());

    rerender(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal onDismiss={onDismissCallback} visible={false} />
      </>
    );

    expect(onDismissCallback).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(outsideElement);
  });

  test('focus is brought back to the element that triggered modal after closing', () => {
    const { rerender } = render(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal visible={false}>
          <a data-testid={'inside'} href={'#hello'}>
            Hello
          </a>
        </Modal>
        <a data-testid={'modal-trigger'} href={'#modal-trigger'}>
          Outside
        </a>
      </>
    );

    const modalTrigger = document.querySelector<HTMLElement>(
      '[data-testid="modal-trigger"]'
    );
    modalTrigger?.focus();
    expect(document.activeElement).toBe(modalTrigger);

    rerender(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal visible={true}>
          <a data-testid={'inside'} href={'#hello'}>
            Hello
          </a>
        </Modal>
        <a data-testid={'modal-trigger'} href={'#modal-trigger'}>
          Outside
        </a>
      </>
    );

    const insideElement = document.querySelector<HTMLElement>(
      '[data-testid="inside"]'
    );

    expect(document.activeElement).toBe(insideElement);

    rerender(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal visible={false}>
          <a data-testid={'inside'} href={'#hello'}>
            Hello
          </a>
        </Modal>
        <a data-testid={'modal-trigger'} href={'#modal-trigger'}>
          Outside
        </a>
      </>
    );

    expect(document.activeElement).toBe(modalTrigger);
  });

  test('focus is brought back to the body when element that triggered modal is removed from the DOM after closing modal', () => {
    const { rerender } = render(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal visible={false}>
          <a data-testid={'inside'} href={'#hello'}>
            Hello
          </a>
        </Modal>
        <a data-testid={'modal-trigger'} href={'#modal-trigger'}>
          Outside
        </a>
      </>
    );

    const modalTrigger = document.querySelector<HTMLElement>(
      '[data-testid="modal-trigger"]'
    );
    modalTrigger?.focus();
    expect(document.activeElement).toBe(modalTrigger);

    rerender(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal visible={true}>
          <a data-testid={'inside'} href={'#hello'}>
            Hello
          </a>
        </Modal>
        <a data-testid={'modal-trigger'} href={'#modal-trigger'}>
          Outside
        </a>
      </>
    );

    const insideElement = document.querySelector<HTMLElement>(
      '[data-testid="inside"]'
    );

    expect(document.activeElement).toBe(insideElement);

    rerender(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal visible={false}>
          <a data-testid={'inside'} href={'#hello'}>
            Hello
          </a>
        </Modal>
      </>
    );

    expect(document.activeElement).toBe(document.body);
  });

  test('focus is trapped when active', () => {
    render(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal visible={true}>
          <a data-testid={'inside'} href={'#hello'}>
            Hello
          </a>
        </Modal>
      </>
    );

    const outsideElement = document.querySelector<HTMLElement>(
      '[data-testid="outside"]'
    );
    const insideElement = document.querySelector<HTMLElement>(
      '[data-testid="inside"]'
    );

    outsideElement?.focus();
    expect(document.activeElement).toBe(insideElement);
  });

  test('focus wraps forwards', () => {
    render(
      <>
        <Modal visible={true}>
          <a data-testid={'inside-a'} href={'#'}>
            Inside A
          </a>
          <a data-testid={'inside-b'} href={'#'}>
            Inside B
          </a>
          <a data-testid={'inside-c'} href={'#'}>
            Inside C
          </a>
        </Modal>
      </>
    );

    const insideStartElement = document.querySelector<HTMLElement>(
      '[data-testid="inside-a"]'
    );
    const insideEndElement = document.querySelector<HTMLElement>(
      '[data-testid="inside-c"]'
    );
    // This is ugly - perhaps there's a better way?
    const focusBracket = insideEndElement?.parentNode?.parentNode?.parentNode
      ?.nextSibling as HTMLElement;
    insideEndElement?.focus();
    focusBracket.focus();
    expect(document.activeElement).toBe(insideStartElement);
  });

  test('focus wraps backwards', () => {
    render(
      <>
        <Modal visible={true}>
          <a data-testid={'inside-a'} href={'#'}>
            Inside A
          </a>
          <a data-testid={'inside-b'} href={'#'}>
            Inside B
          </a>
          <a data-testid={'inside-c'} href={'#'}>
            Inside C
          </a>
        </Modal>
      </>
    );

    const insideStartElement = document.querySelector<HTMLElement>(
      '[data-testid="inside-a"]'
    );
    const insideEndElement = document.querySelector<HTMLElement>(
      '[data-testid="inside-c"]'
    );
    // This is ugly - perhaps there's a better way?
    const focusBracket = insideEndElement?.parentNode?.parentNode?.parentNode
      ?.previousSibling as HTMLElement;
    insideStartElement?.focus();
    focusBracket.focus();
    expect(document.activeElement).toBe(insideEndElement);
  });

  test('focus is trapped without contents', () => {
    render(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal visible={true}>
          <div>There are no focusable contents.</div>
        </Modal>
      </>
    );
    const outsideElement = document.querySelector<HTMLElement>(
      '[data-testid="outside"]'
    );
    outsideElement?.focus();
    expect(document.activeElement).not.toBe(outsideElement);
    expect(document.activeElement).not.toBe(document.body);
  });

  test('focus is not trapped when inactive', () => {
    render(
      <>
        <a data-testid={'outside'} href={'#outside'}>
          Outside
        </a>
        <Modal visible={false}>
          <a data-testid={'inside'} href={'#hello'}>
            Hello
          </a>
        </Modal>
      </>
    );
    const outsideElement = document.querySelector<HTMLElement>(
      '[data-testid="outside"]'
    );
    outsideElement?.focus();
    expect(document.activeElement).toBe(outsideElement);
  });

  test('creates portal outside of the react container', () => {
    const { container, baseElement } = render(
      <Modal visible={true}>
        <a data-testid={'hello'} href={'#hello'}>
          Hello World
        </a>
      </Modal>
    );

    const helloAnchor = document.querySelector<HTMLElement>(
      '[data-testid="hello"]'
    );

    expect(container.children.length).toBe(0);
    expect(helloAnchor).not.toBeNull();
    expect(baseElement.firstChild).toBe(container);
    expect(
      baseElement.lastChild?.firstChild?.contains(helloAnchor)
    ).toBeTruthy();
  });

  test('portal created is a div', () => {
    const { baseElement } = render(
      <Modal visible={true}>
        <a data-testid={'hello'} href={'#hello'}>
          Hello World
        </a>
      </Modal>
    );
    expect((baseElement.lastChild as Element).tagName).toBe('DIV');
  });

  test('ref must be set before `mount` hook', () => {
    const spy = vi.fn();

    function TestComponent() {
      useEffect(() => spy('mount'), []);
      return (
        <Modal visible={true}>
          <a ref={(ref) => (ref ? spy('ref') : spy('noref'))} />
        </Modal>
      );
    }

    render(<TestComponent />);

    expect(spy).toHaveBeenNthCalledWith(1, 'ref');
    expect(spy).toHaveBeenNthCalledWith(2, 'mount');
  });

  test('escape key fires onRequestClose', () => {
    const spy = vi.fn();

    render(<Modal onRequestClose={spy} visible={true} />);

    fireEvent.keyUp(document, { key: 'Escape' });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('escape key fires onRequestClose for top modal only', () => {
    const spyA = vi.fn();
    const spyB = vi.fn();

    render(
      <>
        <Modal onRequestClose={spyA} visible={true} />
        <Modal onRequestClose={spyB} visible={true} />
      </>
    );

    fireEvent.keyUp(document, { key: 'Escape' });

    expect(spyA).toHaveBeenCalledTimes(0);
    expect(spyB).toHaveBeenCalledTimes(1);
  });

  test('escape key fires onRequestClose for top modal only with animation', () => {
    const spyA = vi.fn();
    const spyB = vi.fn();

    const { getByTestId, rerender } = render(
      <>
        <Modal animationType={'slide'} onRequestClose={spyA} visible={false}>
          <a data-testid={'a'} />

          <Modal animationType={'slide'} onRequestClose={spyB} visible={false}>
            <a data-testid={'b'} />
          </Modal>
        </Modal>
      </>
    );

    rerender(
      <>
        <Modal animationType={'slide'} onRequestClose={spyA} visible={true}>
          <a data-testid={'a'} />

          <Modal animationType={'slide'} onRequestClose={spyB} visible={true}>
            <a data-testid={'b'} />
          </Modal>
        </Modal>
      </>
    );

    // This is kind of ugly but I can't find a better way to target just the animation div
    const animationAElement = getByTestId('a').parentElement?.parentElement
      ?.parentElement?.parentElement as HTMLElement;
    const animationBElement = getByTestId('b').parentElement?.parentElement
      ?.parentElement?.parentElement as HTMLElement;

    fireEvent.animationEnd(animationAElement);
    fireEvent.animationEnd(animationBElement);

    fireEvent.keyUp(document, { key: 'Escape' });

    expect(spyA).toHaveBeenCalledTimes(0);
    expect(spyB).toHaveBeenCalledTimes(1);
  });
});
