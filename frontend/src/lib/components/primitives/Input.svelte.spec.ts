import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
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

  it('should apply default styles', async () => {
    const { container } = render(Input, { label: 'Test', id: 'test' });

    const input = container.querySelector('input');
    expect(input?.classList.contains('focus:border-atlantis')).toBe(true);
    expect(input?.classList.contains('focus:ring-atlantis')).toBe(true);
    expect(input?.classList.contains('rounded-md')).toBe(true);
  });

  it('should support different input types', async () => {
    const { container } = render(Input, { label: 'Email', id: 'email', type: 'email' });

    const input = container.querySelector('input');
    expect(input?.getAttribute('type')).toBe('email');
  });

  it('should show error message when error prop is provided', async () => {
    render(Input, { label: 'Name', id: 'name', error: 'This field is required' });

    const error = page.getByText('This field is required');
    await expect.element(error).toBeInTheDocument();
  });

  it('should apply error styles when error exists', async () => {
    const { container } = render(Input, { label: 'Name', id: 'name', error: 'Error' });

    const input = container.querySelector('input');
    expect(input?.classList.contains('border-rust')).toBe(true);
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
});
