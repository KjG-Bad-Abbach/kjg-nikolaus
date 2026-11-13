import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LoadingOverlay from './LoadingOverlay.svelte';

describe('LoadingOverlay', () => {
  it('should render loading spinner when isLoading is true', async () => {
    const { container } = render(LoadingOverlay, { isLoading: true });

    const overlay = container.querySelector('[data-testid="qa-loading"]');
    expect(overlay).toBeTruthy();

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList.contains('animate-spin')).toBe(true);
  });

  it('should not render when isLoading is false', async () => {
    const { container } = render(LoadingOverlay, { isLoading: false });

    const overlay = container.querySelector('[data-testid="qa-loading"]');
    expect(overlay).toBeFalsy();
  });

  it('should toggle visibility when isLoading prop changes', async () => {
    const { container, rerender } = render(LoadingOverlay, { isLoading: false });

    expect(container.querySelector('[data-testid="qa-loading"]')).toBeFalsy();

    await rerender({ isLoading: true });
    expect(container.querySelector('[data-testid="qa-loading"]')).toBeTruthy();

    await rerender({ isLoading: false });
    expect(container.querySelector('[data-testid="qa-loading"]')).toBeFalsy();
  });
});
