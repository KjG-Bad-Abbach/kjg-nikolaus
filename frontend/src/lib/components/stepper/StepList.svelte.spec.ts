import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StepList from './StepList.svelte';
import type { Step } from '$lib/types/booking';

describe('StepList', () => {
  const mockSteps: Step[] = [
    { name: 'Contact Details', testId: 'contact', anyFilled: true, allFilled: true },
    { name: 'Address', testId: 'address', anyFilled: true, allFilled: false },
    { name: 'Time Slots', testId: 'time-slots', anyFilled: false, allFilled: false },
    { name: 'Children', testId: 'children', anyFilled: false, allFilled: false },
    { name: 'Summary', testId: 'summary', anyFilled: false, allFilled: false },
  ];

  it('should render all steps from the steps array', async () => {
    render(StepList, {
      steps: mockSteps,
      currentStep: 0,
      canJumpToAnyStep: false,
    });

    await expect.element(page.getByText('Contact Details')).toBeInTheDocument();
    await expect.element(page.getByText('Address')).toBeInTheDocument();
    await expect.element(page.getByText('Time Slots')).toBeInTheDocument();
    await expect.element(page.getByText('Children')).toBeInTheDocument();
    await expect.element(page.getByText('Summary')).toBeInTheDocument();
  });

  it('should render as ordered list with qa-stepper testid', async () => {
    const { container } = render(StepList, {
      steps: mockSteps,
      currentStep: 0,
      canJumpToAnyStep: false,
    });

    const stepper = container.querySelector('[data-testid="qa-stepper"]');
    expect(stepper?.tagName).toBe('OL');
  });

  it('should call onStepClick with correct step index when Contact Details clicked', async () => {
    const onStepClick = vi.fn();
    render(StepList, {
      steps: mockSteps,
      currentStep: 1,
      canJumpToAnyStep: true,
      onStepClick,
    });

    const step = page.getByRole('button', { name: 'Contact Details' });
    await step.click();

    expect(onStepClick).toHaveBeenCalledOnce();
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it('should call onStepClick with correct step index when Summary clicked', async () => {
    const onStepClick = vi.fn();
    render(StepList, {
      steps: mockSteps,
      currentStep: 0,
      canJumpToAnyStep: true,
      onStepClick,
    });

    const summaryStep = page.getByRole('button', { name: 'Summary' });
    await summaryStep.click();

    expect(onStepClick).toHaveBeenCalledOnce();
    expect(onStepClick).toHaveBeenCalledWith(4);
  });

  it('should pass correct props to StepIndicator components', async () => {
    const { container } = render(StepList, {
      steps: mockSteps,
      currentStep: 2,
      canJumpToAnyStep: true,
    });

    const indicators = container.querySelectorAll('li[data-testid^="qa-step-"]');
    expect(indicators.length).toBe(5);
    expect(indicators[0]?.getAttribute('data-testid')).toBe('qa-step-contact');
    expect(indicators[1]?.getAttribute('data-testid')).toBe('qa-step-address');
  });

  it('should not crash when onStepClick is not provided', async () => {
    render(StepList, {
      steps: mockSteps,
      currentStep: 1,
      canJumpToAnyStep: true,
    });

    const step = page.getByRole('button', { name: 'Contact Details' });
    await step.click();

    const stepper = page.getByTestId('qa-stepper');
    await expect.element(stepper).toBeInTheDocument();
  });

  it('should have progress bar wrapper with background styling', async () => {
    const { container } = render(StepList, {
      steps: mockSteps,
      currentStep: 0,
      canJumpToAnyStep: false,
    });

    const progressBar = container.querySelector('.after\\:bg-java-500');
    expect(progressBar).toBeTruthy();
  });

  it('should pass canJumpToAnyStep to StepIndicator components', async () => {
    const { container: containerCanJump } = render(StepList, {
      steps: mockSteps,
      currentStep: 0,
      canJumpToAnyStep: true,
    });

    const { container: containerNoJump } = render(StepList, {
      steps: mockSteps,
      currentStep: 0,
      canJumpToAnyStep: false,
    });

    // When can jump, middle steps should be clickable
    // When can't jump, only current step should be clickable
    const indicatorsCanJump = containerCanJump.querySelectorAll('button[aria-label="Address"]');
    const indicatorsNoJump = containerNoJump.querySelectorAll('button[aria-label="Address"]');

    expect(indicatorsCanJump[0]?.hasAttribute('disabled')).toBe(false);
    expect(indicatorsNoJump[0]?.hasAttribute('disabled')).toBe(true);
  });

  it('should allow clicking current step even when canJumpToAnyStep is false', async () => {
    const { container } = render(StepList, {
      steps: mockSteps,
      currentStep: 2,
      canJumpToAnyStep: false,
    });

    // Current step (Time Slots at index 2) should be clickable
    const currentStepButton = container.querySelector('button[aria-label="Time Slots"]');
    expect(currentStepButton?.hasAttribute('disabled')).toBe(false);

    // Other steps should be disabled
    const otherStepButton = container.querySelector('button[aria-label="Address"]');
    expect(otherStepButton?.hasAttribute('disabled')).toBe(true);
  });
});
