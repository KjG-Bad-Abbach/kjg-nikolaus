import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LoadingSpinner from './LoadingSpinner.svelte';

describe('LoadingSpinner', () => {
  it('should render spinner SVG', async () => {
    const { container } = render(LoadingSpinner);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should apply custom size class', async () => {
    const { container } = render(LoadingSpinner, {
      sizeClass: 'size-16',
    });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-16')).toBe(true);
  });

  it('should apply custom color class', async () => {
    const { container } = render(LoadingSpinner, {
      colorClass: 'text-red-500',
    });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('text-red-500')).toBe(true);
  });

  it('should have animate-spin class', async () => {
    const { container } = render(LoadingSpinner);

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('animate-spin')).toBe(true);
  });

  it('should use default size and color when not provided', async () => {
    const { container } = render(LoadingSpinner);

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-12')).toBe(true);
    expect(svg?.classList.contains('text-calypso')).toBe(true);
  });

  it('should combine both custom size and color classes', async () => {
    const { container } = render(LoadingSpinner, {
      sizeClass: 'size-10',
      colorClass: 'text-blue-500',
    });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-10')).toBe(true);
    expect(svg?.classList.contains('text-blue-500')).toBe(true);
    expect(svg?.classList.contains('animate-spin')).toBe(true);
  });
});
