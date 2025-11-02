import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CheckIcon from './CheckIcon.svelte';

describe('CheckIcon', () => {
  it('should render check icon SVG', async () => {
    const { container } = render(CheckIcon);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should apply custom size class', async () => {
    const { container } = render(CheckIcon, {
      sizeClass: 'size-8',
    });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-8')).toBe(true);
  });

  it('should use default size when not provided', async () => {
    const { container } = render(CheckIcon);

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-4')).toBe(true);
  });

  it('should have correct viewBox', async () => {
    const { container } = render(CheckIcon);

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 20 20');
  });
});
