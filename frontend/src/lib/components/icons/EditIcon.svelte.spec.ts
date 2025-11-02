import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EditIcon from './EditIcon.svelte';

describe('EditIcon', () => {
  it('should render edit icon SVG', async () => {
    const { container } = render(EditIcon);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should apply custom size class', async () => {
    const { container } = render(EditIcon, {
      sizeClass: 'size-8',
    });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-8')).toBe(true);
  });

  it('should use default size when not provided', async () => {
    const { container } = render(EditIcon);

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-6')).toBe(true);
  });

  it('should have correct viewBox', async () => {
    const { container } = render(EditIcon);

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
  });
});
