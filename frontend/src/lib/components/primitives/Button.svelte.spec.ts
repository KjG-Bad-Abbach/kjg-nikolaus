import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import Button from './Button.svelte';

describe('Button', () => {
  it('should render button with text', async () => {
    const { container } = render(Button, {
      children: createRawSnippet(() => ({ render: () => '<span>Click me</span>' })),
    });

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.tagName).toBe('BUTTON');
  });

  it('should render button text content', async () => {
    render(Button, {
      children: createRawSnippet(() => ({ render: () => '<span>Click me</span>' })),
    });

    const text = page.getByText('Click me');
    await expect.element(text).toBeInTheDocument();
  });

  it('should apply base styles', async () => {
    const { container } = render(Button, {
      children: createRawSnippet(() => ({ render: () => '<span>Button</span>' })),
    });

    const button = container.querySelector('button');
    expect(button?.classList.contains('rounded-sm')).toBe(true);
    expect(button?.classList.contains('px-4')).toBe(true);
    expect(button?.classList.contains('py-2')).toBe(true);
    expect(button?.classList.contains('font-bold')).toBe(true);
    expect(button?.classList.contains('focus:ring-2')).toBe(true);
    expect(button?.classList.contains('focus:outline-hidden')).toBe(true);
    expect(button?.classList.contains('focus:ring-java/50')).toBe(true);
  });

  it('should apply primary variant styles by default', async () => {
    const { container } = render(Button, {
      children: createRawSnippet(() => ({ render: () => '<span>Primary</span>' })),
    });

    const button = container.querySelector('button');
    expect(button?.classList.contains('bg-atlantis')).toBe(true);
    expect(button?.classList.contains('text-white')).toBe(true);
    expect(button?.classList.contains('hover:bg-surfie-green')).toBe(true);
  });

  it('should apply secondary variant styles', async () => {
    const { container } = render(Button, {
      variant: 'secondary',
      children: createRawSnippet(() => ({ render: () => '<span>Secondary</span>' })),
    });

    const button = container.querySelector('button');
    expect(button?.classList.contains('text-calypso')).toBe(true);
    expect(button?.classList.contains('hover:text-calypso-950')).toBe(true);
    expect(button?.classList.contains('bg-atlantis')).toBe(false);
    expect(button?.classList.contains('text-white')).toBe(false);
  });

  it('should handle click events', async () => {
    const onClick = vi.fn();
    render(Button, {
      children: createRawSnippet(() => ({ render: () => '<span>Click</span>' })),
      onclick: onClick,
    });

    const button = page.getByText('Click');
    await button.click();

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', async () => {
    const { container } = render(Button, {
      children: createRawSnippet(() => ({ render: () => '<span>Disabled</span>' })),
      disabled: true,
    });

    const button = container.querySelector('button');
    expect(button?.disabled).toBe(true);
  });

  it('should apply disabled styles for primary variant', async () => {
    const { container } = render(Button, {
      variant: 'primary',
      children: createRawSnippet(() => ({ render: () => '<span>Disabled</span>' })),
      disabled: true,
    });

    const button = container.querySelector('button');
    expect(button?.classList.contains('bg-atlantis')).toBe(true);
    expect(button?.classList.contains('text-white')).toBe(true);
    expect(button?.classList.contains('opacity-50')).toBe(true);
    expect(button?.classList.contains('cursor-not-allowed')).toBe(true);
  });

  it('should apply disabled styles for secondary variant', async () => {
    const { container } = render(Button, {
      variant: 'secondary',
      children: createRawSnippet(() => ({ render: () => '<span>Disabled</span>' })),
      disabled: true,
    });

    const button = container.querySelector('button');
    expect(button?.classList.contains('text-calypso')).toBe(true);
    expect(button?.classList.contains('opacity-50')).toBe(true);
    expect(button?.classList.contains('cursor-not-allowed')).toBe(true);
  });

  it('should support type attribute', async () => {
    const { container } = render(Button, {
      type: 'submit',
      children: createRawSnippet(() => ({ render: () => '<span>Submit</span>' })),
    });

    const button = container.querySelector('button');
    expect(button?.getAttribute('type')).toBe('submit');
  });

  it('should default to button type', async () => {
    const { container } = render(Button, {
      children: createRawSnippet(() => ({ render: () => '<span>Button</span>' })),
    });

    const button = container.querySelector('button');
    expect(button?.getAttribute('type')).toBe('button');
  });

  it('should support reset type', async () => {
    const { container } = render(Button, {
      type: 'reset',
      children: createRawSnippet(() => ({ render: () => '<span>Reset</span>' })),
    });

    const button = container.querySelector('button');
    expect(button?.getAttribute('type')).toBe('reset');
  });

  it('should support data-testid attribute', async () => {
    render(Button, {
      'data-testid': 'qa-test-button',
      children: createRawSnippet(() => ({ render: () => '<span>Test</span>' })),
    });

    const button = page.getByTestId('qa-test-button');
    await expect.element(button).toBeInTheDocument();
  });

  it('should support fullWidth prop', async () => {
    const { container } = render(Button, {
      fullWidth: true,
      children: createRawSnippet(() => ({ render: () => '<span>Full Width</span>' })),
    });

    const button = container.querySelector('button');
    expect(button?.classList.contains('w-full')).toBe(true);
  });

  it('should not have fullWidth by default', async () => {
    const { container } = render(Button, {
      children: createRawSnippet(() => ({ render: () => '<span>Normal</span>' })),
    });

    const button = container.querySelector('button');
    expect(button?.classList.contains('w-full')).toBe(false);
  });

  it('should support custom classes', async () => {
    const { container } = render(Button, {
      class: 'custom-button',
      children: createRawSnippet(() => ({ render: () => '<span>Custom</span>' })),
    });

    const button = container.querySelector('button');
    expect(button?.classList.contains('custom-button')).toBe(true);
    expect(button?.classList.contains('rounded-sm')).toBe(true);
  });

  it('should not be disabled by default', async () => {
    const { container } = render(Button, {
      children: createRawSnippet(() => ({ render: () => '<span>Enabled</span>' })),
    });

    const button = container.querySelector('button');
    expect(button?.disabled).toBe(false);
  });
});
