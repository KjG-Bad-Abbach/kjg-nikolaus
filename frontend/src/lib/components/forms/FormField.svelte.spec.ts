import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormField from './FormField.svelte';
import { createRawSnippet } from 'svelte';

describe('FormField', () => {
  it('should render label with htmlFor attribute', async () => {
    const { container } = render(FormField, { label: 'Test Label', htmlFor: 'test-input' });

    const label = container.querySelector('label');
    expect(label).toBeTruthy();
    expect(label?.getAttribute('for')).toBe('test-input');
    expect(label?.textContent).toBe('Test Label');
  });

  it('should render slot children', async () => {
    const { container } = render(FormField, {
      label: 'Input Field',
      htmlFor: 'input-id',
      children: createRawSnippet(() => ({
        render: () => '<input id="input-id" type="text" placeholder="Enter text" />',
      })),
    });

    const input = container.querySelector('input#input-id');
    expect(input).toBeTruthy();
    expect(input?.getAttribute('placeholder')).toBe('Enter text');
  });

  it('should display single validation error', async () => {
    render(FormField, { label: 'Email', htmlFor: 'email', errors: ['Email is required'] });

    const error = page.getByText('Email is required');
    await expect.element(error).toBeInTheDocument();
  });

  it('should display multiple validation errors in order', async () => {
    render(FormField, {
      label: 'Password',
      htmlFor: 'password',
      errors: ['Password is required', 'Password must be at least 8 characters'],
    });

    const error1 = page.getByText('Password is required');
    const error2 = page.getByText('Password must be at least 8 characters');

    await expect.element(error1).toBeInTheDocument();
    await expect.element(error2).toBeInTheDocument();
  });

  it('should not render errors when array is empty', async () => {
    const { container } = render(FormField, { label: 'Name', htmlFor: 'name', errors: [] });

    const errorDivs = container.querySelectorAll('.text-rust');
    expect(errorDivs.length).toBe(0);
  });

  it('should not render errors when errors prop is not provided', async () => {
    const { container } = render(FormField, { label: 'Name', htmlFor: 'name' });

    const errorDivs = container.querySelectorAll('.text-rust');
    expect(errorDivs.length).toBe(0);
  });

  it('should render with testId attribute', async () => {
    const { container } = render(FormField, {
      label: 'Test Label',
      htmlFor: 'test-input',
      testId: 'qa-form-field',
    });

    const wrapper = container.querySelector('[data-testid="qa-form-field"]');
    expect(wrapper).toBeTruthy();
  });

  it('should not add testId when not provided', async () => {
    const { container } = render(FormField, { label: 'Test Label', htmlFor: 'test-input' });

    const wrapper = container.querySelector('div');
    expect(wrapper?.getAttribute('data-testid')).toBeNull();
  });

  it('should apply correct CSS classes to label', async () => {
    const { container } = render(FormField, { label: 'Styled Label', htmlFor: 'input' });

    const label = container.querySelector('label');
    expect(label?.classList.contains('block')).toBe(true);
    expect(label?.classList.contains('text-left')).toBe(true);
    expect(label?.classList.contains('font-medium')).toBe(true);
    expect(label?.classList.contains('text-surfie-green')).toBe(true);
  });

  it('should apply correct CSS classes to error messages', async () => {
    const { container } = render(FormField, {
      label: 'Field',
      htmlFor: 'field',
      errors: ['Error message'],
    });

    const errorDiv = container.querySelector('.text-rust');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv?.classList.contains('mx-2')).toBe(true);
    expect(errorDiv?.classList.contains('mt-2')).toBe(true);
    expect(errorDiv?.classList.contains('text-left')).toBe(true);
    expect(errorDiv?.classList.contains('text-sm')).toBe(true);
  });

  it('should render children with errors', async () => {
    const { container } = render(FormField, {
      label: 'Email',
      htmlFor: 'email',
      errors: ['Invalid email format'],
      children: createRawSnippet(() => ({
        render: () => '<input id="email" type="email" />',
      })),
    });

    const input = container.querySelector('input#email');
    const error = container.querySelector('.text-rust');

    expect(input).toBeTruthy();
    expect(error).toBeTruthy();
    expect(error?.textContent?.trim()).toBe('Invalid email format');
  });
});
