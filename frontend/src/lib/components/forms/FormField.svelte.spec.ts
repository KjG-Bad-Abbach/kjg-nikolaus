import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormField from './FormField.svelte';

describe('FormField', () => {
  it('should render label', async () => {
    render(FormField, { label: 'Test Label', htmlFor: 'test-input', testId: 'qa-test-field' });

    const label = page.getByText('Test Label');
    await expect.element(label).toBeInTheDocument();
  });

  it('should display single validation error', async () => {
    render(FormField, { label: 'Email', htmlFor: 'email', errors: ['Email is required'] });

    const error = page.getByText('Email is required');
    await expect.element(error).toBeInTheDocument();
  });

  it('should display multiple validation errors', async () => {
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

  it('should not display errors when empty array', async () => {
    const { container } = render(FormField, { label: 'Name', htmlFor: 'name', errors: [] });

    const errorDivs = container.querySelectorAll('.text-rust');
    expect(errorDivs.length).toBe(0);
  });

  it('should apply label styling', async () => {
    const { container } = render(FormField, { label: 'Test Field', htmlFor: 'test' });

    const label = container.querySelector('label');
    expect(label?.classList.contains('text-surfie-green')).toBe(true);
    expect(label?.classList.contains('block')).toBe(true);
    expect(label?.classList.contains('text-left')).toBe(true);
    expect(label?.classList.contains('font-medium')).toBe(true);
  });

  it('should apply error styling', async () => {
    const { container } = render(FormField, {
      label: 'Field',
      htmlFor: 'field',
      errors: ['Error message'],
    });

    const errorDiv = container.querySelector('.text-rust');
    expect(errorDiv?.classList.contains('text-rust')).toBe(true);
    expect(errorDiv?.classList.contains('mx-2')).toBe(true);
    expect(errorDiv?.classList.contains('mt-2')).toBe(true);
    expect(errorDiv?.classList.contains('text-left')).toBe(true);
    expect(errorDiv?.classList.contains('text-sm')).toBe(true);
  });

  it('should link label to input with htmlFor', async () => {
    const { container } = render(FormField, { label: 'Username', htmlFor: 'username-input' });

    const label = container.querySelector('label');
    expect(label?.getAttribute('for')).toBe('username-input');
  });
});
