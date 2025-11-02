import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LoadingOverlay from './LoadingOverlay.svelte';

describe('LoadingOverlay', () => {
  it('should render loading spinner when isLoading is true', async () => {
    render(LoadingOverlay, { isLoading: true });

    const overlay = page.getByTestId('qa-loading');
    await expect.element(overlay).toBeInTheDocument();
  });

  it('should not render when isLoading is false', async () => {
    const { container } = render(LoadingOverlay, { isLoading: false });

    const overlay = container.querySelector('[data-testid="qa-loading"]');
    expect(overlay).toBeFalsy();
  });

  it('should contain LoadingSpinner icon', async () => {
    const { container } = render(LoadingOverlay, { isLoading: true });

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList.contains('animate-spin')).toBe(true);
  });

  it('should apply correct styling classes', async () => {
    const { container } = render(LoadingOverlay, { isLoading: true });

    const overlay = container.querySelector('[data-testid="qa-loading"]');
    expect(overlay?.classList.contains('my-8')).toBe(true);
    expect(overlay?.classList.contains('flex')).toBe(true);
    expect(overlay?.classList.contains('items-center')).toBe(true);
    expect(overlay?.classList.contains('justify-center')).toBe(true);
  });

  it('should use size-12 for spinner', async () => {
    const { container } = render(LoadingOverlay, { isLoading: true });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-12')).toBe(true);
  });

  it('should use text-calypso color', async () => {
    const { container } = render(LoadingOverlay, { isLoading: true });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('text-calypso')).toBe(true);
  });
});
