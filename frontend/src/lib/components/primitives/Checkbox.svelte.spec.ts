import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
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

  it('should apply default styles', async () => {
    const { container } = render(Checkbox, { label: 'Test', id: 'test' });

    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox?.classList.contains('form-checkbox')).toBe(true);
    expect(checkbox?.classList.contains('text-calypso')).toBe(true);
  });

  it('should be checked when checked prop is true', async () => {
    render(Checkbox, { label: 'Test', id: 'test', checked: true });

    const checkbox = page.getByLabelText('Test');
    await expect.element(checkbox).toBeChecked();
  });

  it('should be disabled when disabled prop is true', async () => {
    render(Checkbox, { label: 'Test', id: 'test', disabled: true });

    const checkbox = page.getByLabelText('Test');
    await expect.element(checkbox).toBeDisabled();
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
});
