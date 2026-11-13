import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Checkbox from './Checkbox.svelte';

describe('Checkbox', () => {
  it('should render checkbox with label', async () => {
    render(Checkbox, { label: 'Accept Terms', id: 'terms' });

    const label = page.getByText('Accept Terms');
    const checkbox = page.getByLabelText('Accept Terms');

    await expect.element(label).toBeInTheDocument();
    await expect.element(checkbox).toBeInTheDocument();
  });

  it('should render checkbox without label', async () => {
    const { container } = render(Checkbox, { id: 'test' });

    const checkbox = container.querySelector('input[type="checkbox"]');
    const label = container.querySelector('label');

    expect(checkbox).toBeTruthy();
    expect(label).toBeFalsy();
  });

  it('should apply default styles', async () => {
    const { container } = render(Checkbox, { label: 'Test', id: 'test' });

    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox?.classList.contains('form-checkbox')).toBe(true);
    expect(checkbox?.classList.contains('peer')).toBe(true);
    expect(checkbox?.classList.contains('text-calypso')).toBe(true);
    expect(checkbox?.classList.contains('h-5')).toBe(true);
    expect(checkbox?.classList.contains('w-5')).toBe(true);
  });

  it('should be checked when checked prop is true', async () => {
    render(Checkbox, { label: 'Test', id: 'test', checked: true });

    const checkbox = page.getByLabelText('Test');
    await expect.element(checkbox).toBeChecked();
  });

  it('should be unchecked by default', async () => {
    render(Checkbox, { label: 'Test', id: 'test' });

    const checkbox = page.getByLabelText('Test');
    await expect.element(checkbox).not.toBeChecked();
  });

  it('should be disabled when disabled prop is true', async () => {
    render(Checkbox, { label: 'Test', id: 'test', disabled: true });

    const checkbox = page.getByLabelText('Test');
    await expect.element(checkbox).toBeDisabled();
  });

  it('should apply label styles', async () => {
    const { container } = render(Checkbox, { label: 'Test', id: 'test' });

    const label = container.querySelector('label');
    expect(label?.classList.contains('ml-2')).toBe(true);
    expect(label?.classList.contains('text-gray-800')).toBe(true);
    expect(label?.classList.contains('select-none')).toBe(true);
    expect(label?.classList.contains('peer-disabled:text-gray-300')).toBe(true);
  });

  it('should have correct label htmlFor attribute', async () => {
    const { container } = render(Checkbox, { label: 'Test', id: 'custom-id' });

    const label = container.querySelector('label');
    expect(label?.getAttribute('for')).toBe('custom-id');
  });

  it('should support data-testid attribute', async () => {
    render(Checkbox, { label: 'Test', id: 'test', 'data-testid': 'qa-test-checkbox' });

    const checkbox = page.getByTestId('qa-test-checkbox');
    await expect.element(checkbox).toBeInTheDocument();
  });

  it('should support value attribute', async () => {
    const { container } = render(Checkbox, { label: 'Test', id: 'test', value: 'option-1' });

    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox?.getAttribute('value')).toBe('option-1');
  });

  it('should support required attribute', async () => {
    const { container } = render(Checkbox, { label: 'Test', id: 'test', required: true });

    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox?.hasAttribute('required')).toBe(true);
  });

  it('should support custom classes', async () => {
    const { container } = render(Checkbox, {
      label: 'Test',
      id: 'test',
      class: 'custom-class',
    });

    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox?.classList.contains('custom-class')).toBe(true);
    expect(checkbox?.classList.contains('form-checkbox')).toBe(true);
  });

  it('should handle change event', async () => {
    const handleChange = vi.fn();
    render(Checkbox, {
      label: 'Test',
      id: 'test',
      onchange: handleChange,
    });

    const checkbox = page.getByLabelText('Test');
    await checkbox.click();

    expect(handleChange).toHaveBeenCalled();
  });

  it('should wrap checkbox and label in flex container', async () => {
    const { container } = render(Checkbox, { label: 'Test', id: 'test' });

    const wrapper = container.querySelector('div');
    expect(wrapper?.classList.contains('flex')).toBe(true);
    expect(wrapper?.classList.contains('items-center')).toBe(true);
  });

  it('should handle both checked and disabled together', async () => {
    const { container } = render(Checkbox, {
      label: 'Test',
      id: 'test',
      checked: true,
      disabled: true,
    });

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox?.checked).toBe(true);
    expect(checkbox?.disabled).toBe(true);
  });
});
