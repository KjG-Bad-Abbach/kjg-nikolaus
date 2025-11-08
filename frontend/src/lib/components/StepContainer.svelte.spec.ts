import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import StepContainer from './StepContainer.svelte';

describe('StepContainer', () => {
  const mockSteps = [
    { name: 'Kontakt', testId: 'contact', anyFilled: true, allFilled: true },
    { name: 'Adresse', testId: 'address', anyFilled: false, allFilled: false },
    { name: 'Zeitslots', testId: 'timeslots', anyFilled: false, allFilled: false },
    { name: 'Kinder', testId: 'children', anyFilled: false, allFilled: false },
    { name: 'Übersicht', testId: 'summary', anyFilled: false, allFilled: false },
  ];

  it('should render all step indicators', async () => {
    render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      onStepChange: vi.fn(),
    });

    for (const step of mockSteps) {
      const indicator = page.getByTestId(`qa-step-${step.testId}`);
      await expect.element(indicator).toBeInTheDocument();
    }
  });

  it('should navigate to next step', async () => {
    const onStepChange = vi.fn();
    render(StepContainer, {
      currentStep: 1,
      steps: mockSteps,
      canJumpToAnyStep: true,
      onStepChange,
    });

    const nextButton = page.getByTitle('Nächster Schritt');
    await nextButton.click();

    expect(onStepChange).toHaveBeenCalledWith(2);
  });

  it('should navigate to previous step', async () => {
    const onStepChange = vi.fn();
    render(StepContainer, {
      currentStep: 2,
      steps: mockSteps,
      canJumpToAnyStep: true,
      onStepChange,
    });

    const prevButton = page.getByTitle('Vorheriger Schritt');
    await prevButton.click();

    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it('should disable previous button on first step', async () => {
    const { container } = render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      canJumpToAnyStep: true,
      onStepChange: vi.fn(),
    });

    const prevButton = container.querySelector('[title="Vorheriger Schritt"]');
    expect(prevButton?.hasAttribute('disabled')).toBe(true);
  });

  it('should disable next button on last step', async () => {
    const { container } = render(StepContainer, {
      currentStep: 4,
      steps: mockSteps,
      canJumpToAnyStep: true,
      onStepChange: vi.fn(),
    });

    const nextButton = container.querySelector('[title="Nächster Schritt"]');
    expect(nextButton?.hasAttribute('disabled')).toBe(true);
  });

  it('should navigate by clicking step indicator when canJumpToAnyStep is true', async () => {
    const onStepChange = vi.fn();
    render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      canJumpToAnyStep: true,
      onStepChange,
    });

    const indicator = page.getByTestId(`qa-step-${mockSteps[2].testId}`).getByRole('button');
    await indicator.click();

    expect(onStepChange).toHaveBeenCalledWith(2);
  });

  it('should hide navigation buttons when canJumpToAnyStep is false', () => {
    const { container } = render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      canJumpToAnyStep: false,
      onStepChange: vi.fn(),
    });

    const prevButton = container.querySelector('[title="Vorheriger Schritt"]');
    const nextButton = container.querySelector('[title="Nächster Schritt"]');

    expect(prevButton?.classList.contains('hidden')).toBe(true);
    expect(nextButton?.classList.contains('hidden')).toBe(true);
  });

  it('should disable step indicators when canJumpToAnyStep is false', () => {
    const { container } = render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      canJumpToAnyStep: false,
      onStepChange: vi.fn(),
    });

    // Check that non-current step indicators are disabled
    const indicator = container.querySelector(
      `[data-testid="qa-step-${mockSteps[2].testId}"] button`,
    );
    expect(indicator?.hasAttribute('disabled')).toBe(true);
  });

  it('should render slot content', () => {
    render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      onStepChange: vi.fn(),
      children: createRawSnippet(() => ({
        render: () => `
          <div role="region" aria-label="Step Content">
            <p>This is the content for the current step.</p>
          </div>
          `,
      })),
    });

    const slotContainer = page.getByRole('region', { name: 'Step Content' });
    expect(slotContainer).toBeTruthy();
  });
});
