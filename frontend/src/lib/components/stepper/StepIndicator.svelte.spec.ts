import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StepIndicator from './StepIndicator.svelte';

describe('StepIndicator', () => {
  it('should display step number when not completed', async () => {
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

  it('should display checkmark when all fields are filled', async () => {
    const { container } = render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: false,
      allFilled: true,
      canJumpTo: true,
    });

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
    expect(circle?.classList.contains('bg-calypso')).toBe(true);
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

  it('should call onClick with correct index when clicked', async () => {
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

  it('should not crash when onClick is not provided and button is clicked', async () => {
    render(StepIndicator, {
      index: 2,
      name: 'Address',
      isCurrent: false,
      allFilled: false,
      canJumpTo: true,
    });

    const step = page.getByRole('button', { name: 'Address' });
    await step.click();

    // If we get here without crashing, the test passes
    await expect.element(step).toBeInTheDocument();
  });

  it('should disable button when cannot jump to step', async () => {
    const { container } = render(StepIndicator, {
      index: 2,
      name: 'Address',
      isCurrent: false,
      allFilled: false,
      canJumpTo: false,
    });

    const button = container.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
  });

  it('should enable button when can jump to step', async () => {
    const { container } = render(StepIndicator, {
      index: 2,
      name: 'Address',
      isCurrent: false,
      allFilled: false,
      canJumpTo: true,
    });

    const button = container.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(false);
  });

  it('should display step name in button label', async () => {
    render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: false,
      allFilled: false,
      canJumpTo: false,
    });

    const button = page.getByRole('button', { name: 'Contact Details' });
    await expect.element(button).toBeInTheDocument();
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

  it('should calculate correct step number from index (index + 1)', async () => {
    render(StepIndicator, {
      index: 4,
      name: 'Summary',
      isCurrent: false,
      allFilled: false,
      canJumpTo: false,
    });

    const stepNumber = page.getByText('5');
    await expect.element(stepNumber).toBeInTheDocument();
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

  it('should apply both filled and current styles when both conditions are true', async () => {
    const { container } = render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: true,
      allFilled: true,
      canJumpTo: true,
    });

    const circle = container.querySelector('span.rounded-full');
    expect(circle?.classList.contains('bg-calypso')).toBe(true);
    expect(circle?.classList.contains('border-calypso-950')).toBe(true);
    expect(circle?.classList.contains('text-calypso-500')).toBe(true);

    // Should show checkmark, not number
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should not apply filled or current background when neither condition is true', async () => {
    const { container } = render(StepIndicator, {
      index: 0,
      name: 'Contact Details',
      isCurrent: false,
      allFilled: false,
      canJumpTo: false,
    });

    const circle = container.querySelector('span.rounded-full');
    expect(circle?.classList.contains('bg-calypso')).toBe(false);
    expect(circle?.classList.contains('bg-java-500')).toBe(true);
    expect(circle?.classList.contains('border-java')).toBe(true);
  });
});
