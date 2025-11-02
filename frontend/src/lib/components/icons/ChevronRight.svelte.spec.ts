import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ChevronRight from './ChevronRight.svelte';

describe('ChevronRight', () => {
  it('should render chevron right icon SVG', async () => {
    const { container } = render(ChevronRight);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should apply custom size class', async () => {
    const { container } = render(ChevronRight, {
      sizeClass: 'size-12',
    });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-12')).toBe(true);
  });

  it('should use default size when not provided', async () => {
    const { container } = render(ChevronRight);

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-8')).toBe(true);
  });

  it('should have correct viewBox', async () => {
    const { container } = render(ChevronRight);

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 16 16');
  });
});
