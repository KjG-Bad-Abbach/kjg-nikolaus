import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Textarea from './Textarea.svelte';

describe('Textarea', () => {
  it('should render textarea with label', async () => {
    render(Textarea, { label: 'Description', id: 'description' });

    const label = page.getByText('Description');
    const textarea = page.getByLabelText('Description');

    await expect.element(label).toBeInTheDocument();
    await expect.element(textarea).toBeInTheDocument();
  });

  it('should apply default styles', async () => {
    const { container } = render(Textarea, { label: 'Test', id: 'test' });

    const textarea = container.querySelector('textarea');
    expect(textarea?.classList.contains('focus:border-atlantis')).toBe(true);
    expect(textarea?.classList.contains('focus:ring-atlantis')).toBe(true);
    expect(textarea?.classList.contains('rounded-md')).toBe(true);
  });

  it('should show error message when error prop is provided', async () => {
    render(Textarea, { label: 'Description', id: 'description', error: 'This field is required' });

    const error = page.getByText('This field is required');
    await expect.element(error).toBeInTheDocument();
  });

  it('should apply error styles when error exists', async () => {
    const { container } = render(Textarea, {
      label: 'Description',
      id: 'description',
      error: 'Error',
    });

    const textarea = container.querySelector('textarea');
    expect(textarea?.classList.contains('border-rust')).toBe(true);
  });

  it('should be readonly when readonly prop is true', async () => {
    render(Textarea, { label: 'Description', id: 'description', readonly: true });

    const textarea = page.getByLabelText('Description');
    await expect.element(textarea).toHaveAttribute('readonly');
  });

  it('should support rows attribute', async () => {
    const { container } = render(Textarea, { label: 'Description', id: 'description', rows: 8 });

    const textarea = container.querySelector('textarea');
    expect(textarea?.getAttribute('rows')).toBe('8');
  });

  it('should support placeholder attribute', async () => {
    const { container } = render(Textarea, {
      label: 'Description',
      id: 'description',
      placeholder: 'Enter description',
    });

    const textarea = container.querySelector('textarea');
    expect(textarea?.getAttribute('placeholder')).toBe('Enter description');
  });

  it('should support data-testid attribute', async () => {
    render(Textarea, {
      label: 'Description',
      id: 'description',
      'data-testid': 'qa-test-textarea',
    });

    const textarea = page.getByTestId('qa-test-textarea');
    await expect.element(textarea).toBeInTheDocument();
  });
});
