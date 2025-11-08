import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
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

  it('should render textarea without label', async () => {
    const { container } = render(Textarea, { id: 'test' });

    const textarea = container.querySelector('textarea');
    const label = container.querySelector('label');

    expect(textarea).toBeTruthy();
    expect(label).toBeFalsy();
  });

  it('should apply default styles', async () => {
    const { container } = render(Textarea, { label: 'Test', id: 'test' });

    const textarea = container.querySelector('textarea');
    expect(textarea?.classList.contains('mt-1')).toBe(true);
    expect(textarea?.classList.contains('block')).toBe(true);
    expect(textarea?.classList.contains('w-full')).toBe(true);
    expect(textarea?.classList.contains('rounded-md')).toBe(true);
    expect(textarea?.classList.contains('border')).toBe(true);
    expect(textarea?.classList.contains('p-2')).toBe(true);
    expect(textarea?.classList.contains('shadow-xs')).toBe(true);
    expect(textarea?.classList.contains('focus:border-atlantis')).toBe(true);
    expect(textarea?.classList.contains('focus:ring-atlantis')).toBe(true);
  });

  it('should apply border-gray-300 class when no error', async () => {
    const { container } = render(Textarea, { label: 'Test', id: 'test' });

    const textarea = container.querySelector('textarea');
    expect(textarea?.classList.contains('border-gray-300')).toBe(true);
    expect(textarea?.classList.contains('border-rust')).toBe(false);
  });

  it('should show error message when error prop is provided', async () => {
    render(Textarea, { label: 'Description', id: 'description', error: 'This field is required' });

    const error = page.getByText('This field is required');
    await expect.element(error).toBeInTheDocument();
  });

  it('should not show error when error is empty string', async () => {
    const { container } = render(Textarea, { label: 'Description', id: 'description', error: '' });

    const errorMsg = container.querySelector('p');
    expect(errorMsg).toBeFalsy();
  });

  it('should apply error styles when error exists', async () => {
    const { container } = render(Textarea, {
      label: 'Description',
      id: 'description',
      error: 'Error',
    });

    const textarea = container.querySelector('textarea');
    expect(textarea?.classList.contains('border-rust')).toBe(true);
    expect(textarea?.classList.contains('border-gray-300')).toBe(false);
  });

  it('should apply error message styles', async () => {
    const { container } = render(Textarea, {
      label: 'Description',
      id: 'description',
      error: 'Error text',
    });

    const errorMsg = container.querySelector('p');
    expect(errorMsg?.classList.contains('text-sm')).toBe(true);
    expect(errorMsg?.classList.contains('text-rust')).toBe(true);
  });

  it('should be readonly when readonly prop is true', async () => {
    render(Textarea, { label: 'Description', id: 'description', readonly: true });

    const textarea = page.getByLabelText('Description');
    await expect.element(textarea).toHaveAttribute('readonly');
  });

  it('should apply default rows value', async () => {
    const { container } = render(Textarea, { label: 'Description', id: 'description' });

    const textarea = container.querySelector('textarea');
    expect(textarea?.getAttribute('rows')).toBe('4');
  });

  it('should support custom rows attribute', async () => {
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

  it('should have correct label styles', async () => {
    const { container } = render(Textarea, { label: 'Description', id: 'description' });

    const label = container.querySelector('label');
    expect(label?.classList.contains('block')).toBe(true);
    expect(label?.classList.contains('text-sm')).toBe(true);
    expect(label?.classList.contains('font-medium')).toBe(true);
    expect(label?.classList.contains('text-gray-700')).toBe(true);
  });

  it('should have correct label htmlFor attribute', async () => {
    const { container } = render(Textarea, { label: 'Description', id: 'custom-id' });

    const label = container.querySelector('label');
    expect(label?.getAttribute('for')).toBe('custom-id');
  });

  it('should support value attribute', async () => {
    const { container } = render(Textarea, {
      label: 'Description',
      id: 'description',
      value: 'Test content',
    });

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea?.value).toBe('Test content');
  });

  it('should support custom classes', async () => {
    const { container } = render(Textarea, {
      label: 'Test',
      id: 'test',
      class: 'custom-class',
    });

    const textarea = container.querySelector('textarea');
    expect(textarea?.classList.contains('custom-class')).toBe(true);
    expect(textarea?.classList.contains('focus:border-atlantis')).toBe(true);
  });

  it('should support disabled attribute', async () => {
    render(Textarea, { label: 'Description', id: 'description', disabled: true });

    const textarea = page.getByLabelText('Description');
    await expect.element(textarea).toBeDisabled();
  });

  it('should wrap textarea in space-y-1 container', async () => {
    const { container } = render(Textarea, { label: 'Test', id: 'test' });

    const wrapper = container.querySelector('div');
    expect(wrapper?.classList.contains('space-y-1')).toBe(true);
  });

  it('should handle input event', async () => {
    const handleInput = vi.fn();
    render(Textarea, {
      label: 'Test',
      id: 'test',
      oninput: handleInput,
    });

    const textarea = page.getByLabelText('Test');
    await textarea.fill('test content');

    expect(handleInput).toHaveBeenCalled();
  });

  it('should display both error and value together', async () => {
    const { container } = render(Textarea, {
      label: 'Description',
      id: 'description',
      value: 'Some content',
      error: 'This field has an error',
    });

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const errorMsg = container.querySelector('p');

    expect(textarea?.value).toBe('Some content');
    expect(errorMsg?.textContent).toBe('This field has an error');
    expect(textarea?.classList.contains('border-rust')).toBe(true);
  });
});
