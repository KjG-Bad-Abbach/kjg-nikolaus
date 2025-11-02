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

  it('should apply primary variant styles by default', async () => {
    const { container } = render(Button, {
      children: createRawSnippet(() => ({ render: () => '<span>Primary</span>' })),
    });

    const button = container.querySelector('button');
    expect(button?.classList.contains('bg-atlantis')).toBe(true);
    expect(button?.classList.contains('text-white')).toBe(true);
  });

  it('should apply secondary variant styles', async () => {
    const { container } = render(Button, {
      variant: 'secondary',
      children: createRawSnippet(() => ({ render: () => '<span>Secondary</span>' })),
    });

    const button = container.querySelector('button');
    expect(button?.classList.contains('text-calypso')).toBe(true);
    expect(button?.classList.contains('bg-atlantis')).toBe(false);
  });

  it('should handle click events', async () => {
    const onClick = vi.fn();
    const { container } = render(Button, {
      children: createRawSnippet(() => ({ render: () => '<span>Click</span>' })),
      onclick: onClick,
    });

    const button = container.querySelector('button');
    button?.click();

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

  it('should apply disabled styles', async () => {
    const { container } = render(Button, {
      children: createRawSnippet(() => ({ render: () => '<span>Disabled</span>' })),
      disabled: true,
    });

    const button = container.querySelector('button');
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
});
