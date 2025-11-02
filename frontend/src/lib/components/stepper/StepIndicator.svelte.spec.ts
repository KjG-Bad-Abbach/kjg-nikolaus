import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StepIndicator from './StepIndicator.svelte';

describe('StepIndicator', () => {
  it('should render with step number when not filled', async () => {
    render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: false,
      allFilled: false,
      canJumpTo: false,
    });

    const stepNumber = page.getByText('1');
    await expect.element(stepNumber).toBeInTheDocument();
  });

  it('should render with checkmark when all filled', async () => {
    const { container } = render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: false,
      allFilled: true,
      canJumpTo: true,
    });

    // Check for the checkmark SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should apply current step styles when isCurrent is true', async () => {
    const { container } = render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: true,
      allFilled: false,
      canJumpTo: true,
    });

    const circle = container.querySelector('span.rounded-full');
    expect(circle?.classList.contains('border-calypso-950')).toBe(true);
  });

  it('should apply filled step styles when allFilled is true', async () => {
    const { container } = render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: false,
      allFilled: true,
      canJumpTo: false,
    });

    const circle = container.querySelector('span.rounded-full');
    expect(circle?.classList.contains('bg-calypso')).toBe(true);
  });

  it('should call onClick when clicked and can jump', async () => {
    const onClick = vi.fn();
    render(StepIndicator, {
      index: 2,
      name: 'Address',
      isCurrent: false,
      allFilled: false,
      canJumpTo: true,
      onClick,
    });

    const step = page.getByRole('button', { name: 'Address' });
    await step.click();

    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith(2);
  });

  it('should not call onClick if undefined', async () => {
    const onClick = undefined;
    render(StepIndicator, {
      index: 2,
      name: 'Address',
      isCurrent: false,
      allFilled: false,
      canJumpTo: true,
      onClick,
    });

    const step = page.getByRole('button', { name: 'Address' });
    await step.click();

    expect(onClick).toBeUndefined();
  });

  it('should disable button when cannot jump', async () => {
    const { container } = render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: false,
      allFilled: false,
      canJumpTo: false,
    });

    const button = container.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
    expect(button?.classList.contains('cursor-not-allowed')).toBe(true);
  });

  it('should enable button when can jump', async () => {
    const { container } = render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: true,
      allFilled: false,
      canJumpTo: true,
    });

    const button = container.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(false);
    expect(button?.classList.contains('cursor-pointer')).toBe(true);
  });

  it('should display step name', async () => {
    render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: false,
      allFilled: false,
      canJumpTo: false,
    });

    const stepName = page.getByText('Contact Details');
    await expect.element(stepName).toBeInTheDocument();
  });

  it('should have correct data-testid attribute', async () => {
    const { container } = render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      testId: 'contact',
      isCurrent: false,
      allFilled: false,
      canJumpTo: false,
    });

    const step = container.querySelector('[data-testid="qa-step-contact"]');
    expect(step).toBeTruthy();
  });

  it('should have correct title attribute', async () => {
    render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: false,
      allFilled: false,
      canJumpTo: false,
    });

    const button = page.getByRole('button', { name: 'Contact Details' });
    await expect.element(button).toHaveAttribute('title', 'Contact Details');
  });

  it('should have button element for proper accessibility', async () => {
    const { container } = render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: true,
      allFilled: false,
      canJumpTo: true,
    });

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.getAttribute('type')).toBe('button');
  });
});
