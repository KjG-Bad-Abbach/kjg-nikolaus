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

  it('should render all steps', async () => {
    render(StepList, {
      steps: mockSteps,
      currentStep: 0,
      canJumpToAnyStep: false,
    });

    const contactStep = page.getByText('Contact Details');
    const addressStep = page.getByText('Address');
    const timeSlotsStep = page.getByText('Time Slots');

    await expect.element(contactStep).toBeInTheDocument();
    await expect.element(addressStep).toBeInTheDocument();
    await expect.element(timeSlotsStep).toBeInTheDocument();
  });

  it('should have progress bar wrapper', async () => {
    const { container } = render(StepList, {
      steps: mockSteps,
      currentStep: 0,
      canJumpToAnyStep: false,
    });

    const progressBar = container.querySelector('.after\\:bg-java-500');
    expect(progressBar).toBeTruthy();
  });

  it('should render ordered list with correct testid', async () => {
    const { container } = render(StepList, {
      steps: mockSteps,
      currentStep: 0,
      canJumpToAnyStep: false,
    });

    const stepper = container.querySelector('[data-testid="qa-stepper"]');
    expect(stepper?.tagName).toBe('OL');
  });

  it('should call onStepClick when step is clicked', async () => {
    const onStepClick = vi.fn();
    render(StepList, {
      steps: mockSteps,
      currentStep: 1,
      canJumpToAnyStep: true,
      onStepClick,
    });

    // Click on the first step
    const step = page.getByText('Contact Details');
    await step.click();

    expect(onStepClick).toHaveBeenCalledOnce();
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it('should render 5 step indicators for 5 steps', async () => {
    const { container } = render(StepList, {
      steps: mockSteps,
      currentStep: 0,
      canJumpToAnyStep: false,
    });

    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(5);
  });

  it('should have correct flex layout classes', async () => {
    const { container } = render(StepList, {
      steps: mockSteps,
      currentStep: 0,
      canJumpToAnyStep: false,
    });

    const orderedList = container.querySelector('ol');
    expect(orderedList?.classList.contains('flex')).toBe(true);
    expect(orderedList?.classList.contains('justify-between')).toBe(true);
    expect(orderedList?.classList.contains('relative')).toBe(true);
    expect(orderedList?.classList.contains('z-10')).toBe(true);
  });

  it('should apply correct colors to text', async () => {
    const { container } = render(StepList, {
      steps: mockSteps,
      currentStep: 0,
      canJumpToAnyStep: false,
    });

    const orderedList = container.querySelector('ol');
    expect(orderedList?.classList.contains('text-calypso')).toBe(true);
  });

  it('should not crash when onStepClick is not provided', async () => {
    render(StepList, {
      steps: mockSteps,
      currentStep: 1,
      canJumpToAnyStep: true,
      // No onStepClick provided
    });

    // Click on the first step - should not crash
    const step = page.getByText('Contact Details');
    await step.click();

    // If we get here without crashing, the test passes
    const stepper = page.getByTestId('qa-stepper');
    await expect.element(stepper).toBeInTheDocument();
  });
});
