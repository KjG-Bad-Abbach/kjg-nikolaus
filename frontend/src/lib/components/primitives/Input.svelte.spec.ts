import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Input from './Input.svelte';

describe('Input', () => {
  it('should render input with label', async () => {
    render(Input, { label: 'First Name', id: 'first-name' });

    const label = page.getByText('First Name');
    const input = page.getByLabelText('First Name');

    await expect.element(label).toBeInTheDocument();
    await expect.element(input).toBeInTheDocument();
  });

  it('should render input without label', async () => {
    const { container } = render(Input, { id: 'test' });

    const input = container.querySelector('input');
    const label = container.querySelector('label');

    expect(input).toBeTruthy();
    expect(label).toBeFalsy();
  });

  it('should apply default text type', async () => {
    const { container } = render(Input, { label: 'Test', id: 'test' });

    const input = container.querySelector('input');
    expect(input?.getAttribute('type')).toBe('text');
  });

  it('should apply default styles', async () => {
    const { container } = render(Input, { label: 'Test', id: 'test' });

    const input = container.querySelector('input');
    expect(input?.classList.contains('mt-1')).toBe(true);
    expect(input?.classList.contains('block')).toBe(true);
    expect(input?.classList.contains('w-full')).toBe(true);
    expect(input?.classList.contains('rounded-md')).toBe(true);
    expect(input?.classList.contains('border')).toBe(true);
    expect(input?.classList.contains('p-2')).toBe(true);
    expect(input?.classList.contains('shadow-xs')).toBe(true);
    expect(input?.classList.contains('focus:border-atlantis')).toBe(true);
    expect(input?.classList.contains('focus:ring-atlantis')).toBe(true);
  });

  it('should apply border-gray-300 class when no error', async () => {
    const { container } = render(Input, { label: 'Test', id: 'test' });

    const input = container.querySelector('input');
    expect(input?.classList.contains('border-gray-300')).toBe(true);
    expect(input?.classList.contains('border-rust')).toBe(false);
  });

  it('should support different input types', async () => {
    const { container } = render(Input, { label: 'Email', id: 'email', type: 'email' });

    const input = container.querySelector('input');
    expect(input?.getAttribute('type')).toBe('email');
  });

  it('should support password type', async () => {
    const { container } = render(Input, { label: 'Password', id: 'password', type: 'password' });

    const input = container.querySelector('input');
    expect(input?.getAttribute('type')).toBe('password');
  });

  it('should support number type', async () => {
    const { container } = render(Input, { label: 'Age', id: 'age', type: 'number' });

    const input = container.querySelector('input');
    expect(input?.getAttribute('type')).toBe('number');
  });

  it('should show error message when error prop is provided', async () => {
    render(Input, { label: 'Name', id: 'name', error: 'This field is required' });

    const error = page.getByText('This field is required');
    await expect.element(error).toBeInTheDocument();
  });

  it('should not show error when error is empty string', async () => {
    const { container } = render(Input, { label: 'Name', id: 'name', error: '' });

    const errorMsg = container.querySelector('p');
    expect(errorMsg).toBeFalsy();
  });

  it('should apply error styles when error exists', async () => {
    const { container } = render(Input, { label: 'Name', id: 'name', error: 'Error' });

    const input = container.querySelector('input');
    expect(input?.classList.contains('border-rust')).toBe(true);
    expect(input?.classList.contains('border-gray-300')).toBe(false);
  });

  it('should apply error message styles', async () => {
    const { container } = render(Input, { label: 'Name', id: 'name', error: 'Error text' });

    const errorMsg = container.querySelector('p');
    expect(errorMsg?.classList.contains('text-sm')).toBe(true);
    expect(errorMsg?.classList.contains('text-rust')).toBe(true);
  });

  it('should be readonly when readonly prop is true', async () => {
    render(Input, { label: 'Name', id: 'name', readonly: true });

    const input = page.getByLabelText('Name');
    await expect.element(input).toHaveAttribute('readonly');
  });

  it('should support required attribute', async () => {
    const { container } = render(Input, { label: 'Name', id: 'name', required: true });

    const input = container.querySelector('input');
    expect(input?.hasAttribute('required')).toBe(true);
  });

  it('should support disabled attribute', async () => {
    render(Input, { label: 'Name', id: 'name', disabled: true });

    const input = page.getByLabelText('Name');
    await expect.element(input).toBeDisabled();
  });

  it('should have correct label styles', async () => {
    const { container } = render(Input, { label: 'Name', id: 'name' });

    const label = container.querySelector('label');
    expect(label?.classList.contains('block')).toBe(true);
    expect(label?.classList.contains('text-sm')).toBe(true);
    expect(label?.classList.contains('font-medium')).toBe(true);
    expect(label?.classList.contains('text-gray-700')).toBe(true);
  });

  it('should have correct label htmlFor attribute', async () => {
    const { container } = render(Input, { label: 'Name', id: 'custom-id' });

    const label = container.querySelector('label');
    expect(label?.getAttribute('for')).toBe('custom-id');
  });

  it('should support data-testid attribute', async () => {
    render(Input, { label: 'Name', id: 'name', 'data-testid': 'qa-test-input' });

    const input = page.getByTestId('qa-test-input');
    await expect.element(input).toBeInTheDocument();
  });

  it('should support placeholder attribute', async () => {
    const { container } = render(Input, {
      label: 'Name',
      id: 'name',
      placeholder: 'Enter your name',
    });

    const input = container.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Enter your name');
  });

  it('should support value attribute', async () => {
    const { container } = render(Input, {
      label: 'Name',
      id: 'name',
      value: 'John Doe',
    });

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input?.value).toBe('John Doe');
  });

  it('should support custom classes', async () => {
    const { container } = render(Input, {
      label: 'Test',
      id: 'test',
      class: 'custom-class',
    });

    const input = container.querySelector('input');
    expect(input?.classList.contains('custom-class')).toBe(true);
    expect(input?.classList.contains('focus:border-atlantis')).toBe(true);
  });

  it('should wrap input in space-y-1 container', async () => {
    const { container } = render(Input, { label: 'Test', id: 'test' });

    const wrapper = container.querySelector('div');
    expect(wrapper?.classList.contains('space-y-1')).toBe(true);
  });

  it('should handle input event', async () => {
    const handleInput = vi.fn();
    render(Input, {
      label: 'Test',
      id: 'test',
      oninput: handleInput,
    });

    const input = page.getByLabelText('Test');
    await input.fill('test value');

    expect(handleInput).toHaveBeenCalled();
  });

  it('should display both error and value together', async () => {
    const { container } = render(Input, {
      label: 'Name',
      id: 'name',
      value: 'John Doe',
      error: 'This field has an error',
    });

    const input = container.querySelector('input') as HTMLInputElement;
    const errorMsg = container.querySelector('p');

    expect(input?.value).toBe('John Doe');
    expect(errorMsg?.textContent).toBe('This field has an error');
    expect(input?.classList.contains('border-rust')).toBe(true);
  });
});
