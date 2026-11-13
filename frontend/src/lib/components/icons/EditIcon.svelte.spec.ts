import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EditIcon from './EditIcon.svelte';

describe('EditIcon', () => {
  it('should render with correct defaults', async () => {
    const { container } = render(EditIcon);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.classList.contains('size-6')).toBe(true);
  });

  it('should apply custom size class', async () => {
    const { container } = render(EditIcon, {
      sizeClass: 'size-8',
    });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-8')).toBe(true);
  });

  it('should apply custom color class', async () => {
    const { container } = render(EditIcon, {
      colorClass: 'text-green-500',
    });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-6')).toBe(true);
    expect(svg?.classList.contains('text-green-500')).toBe(true);
  });

  it('should apply additional classes', async () => {
    const { container } = render(EditIcon, {
      class: 'custom-class',
    });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-6')).toBe(true);
    expect(svg?.classList.contains('custom-class')).toBe(true);
  });

  it('should apply all classes together', async () => {
    const { container } = render(EditIcon, {
      sizeClass: 'size-8',
      colorClass: 'text-blue-600',
      class: 'extra-class',
    });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-8')).toBe(true);
    expect(svg?.classList.contains('text-blue-600')).toBe(true);
    expect(svg?.classList.contains('extra-class')).toBe(true);
  });

  it('should handle undefined optional props correctly', async () => {
    const { container } = render(EditIcon, {
      sizeClass: 'size-10',
      colorClass: undefined,
      class: undefined,
    });

    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('size-10')).toBe(true);
    expect(svg?.classList.contains('undefined')).toBe(false);
  });
});
