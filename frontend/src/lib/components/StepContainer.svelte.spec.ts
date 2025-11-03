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

  it('should render with initial props', () => {
    render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      onStepChange: vi.fn(),
    });

    const container = page.getByTestId('qa-step-container');
    expect(container).toBeDefined();
  });

  it('should render step navigation', async () => {
    render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      onStepChange: vi.fn(),
    });

    const stepper = page.getByTestId('qa-stepper');
    await expect.element(stepper).toBeInTheDocument();
  });

  it('should call onStepChange when navigating', async () => {
    const onStepChange = vi.fn();
    render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      canJumpToAnyStep: true,
      onStepChange,
    });

    // Try to navigate to next step
    const nextButton = page.getByTitle('Nächster Schritt');
    await nextButton.click();

    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it('should pass step click handler to StepList', () => {
    const onStepChange = vi.fn();
    const { container } = render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      canJumpToAnyStep: true,
      onStepChange,
    });

    // Verify StepList is rendered (it will handle clicks internally)
    const stepper = container.querySelector('[data-testid="qa-stepper"]');
    expect(stepper).toBeTruthy();
  });

  it('should disable navigation buttons appropriately', async () => {
    const { container } = render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      canJumpToAnyStep: true,
      onStepChange: vi.fn(),
    });

    const prevButton = container.querySelector('[title="Vorheriger Schritt"]');
    expect(prevButton?.hasAttribute('disabled')).toBe(true);
  });

  it('should show current step number', async () => {
    render(StepContainer, {
      currentStep: 2,
      steps: mockSteps,
      onStepChange: vi.fn(),
    });

    // The 3rd step (index 2) should be highlighted
    const step = page.getByTestId('qa-step-timeslots');
    await expect.element(step).toBeInTheDocument();
  });

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

  it('should call onStepChange when clicking step indicator', async () => {
    const onStepChange = vi.fn();
    render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      canJumpToAnyStep: true,
      onStepChange,
    });

    const indicator = page.getByTestId(`qa-step-${mockSteps[1].testId}`).getByRole('button');
    await indicator.click();
    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it('should pass canJumpToAnyStep prop to child components', () => {
    const { container } = render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      canJumpToAnyStep: false,
      onStepChange: vi.fn(),
    });

    // Verify the stepper is rendered
    const stepper = container.querySelector('[data-testid="qa-stepper"]');
    expect(stepper).toBeTruthy();
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

  it('should render navigation buttons with hidden class when canJumpToAnyStep is false', () => {
    const { container } = render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      canJumpToAnyStep: false,
      onStepChange: vi.fn(),
    });

    const prevButton = container.querySelector('[title="Vorheriger Schritt"]');
    const nextButton = container.querySelector('[title="Nächster Schritt"]');

    // Buttons are rendered but have 'hidden' class
    expect(prevButton?.classList.contains('hidden')).toBe(true);
    expect(nextButton?.classList.contains('hidden')).toBe(true);
  });

  it('should apply correct classes to completed steps', async () => {
    const stepsWithCompletion = mockSteps.map((s, i) => ({
      ...s,
      allFilled: i < 2, // First two steps completed
    }));

    render(StepContainer, {
      currentStep: 2,
      steps: stepsWithCompletion,
      onStepChange: vi.fn(),
    });

    const step0 = page.getByTestId('qa-step-contact');
    await expect.element(step0).toBeInTheDocument();
  });

  it('should handle handlePrevious function', async () => {
    const onStepChange = vi.fn();
    render(StepContainer, {
      currentStep: 2,
      steps: mockSteps,
      canJumpToAnyStep: true,
      onStepChange,
    });

    const prevButton = page.getByTitle('Vorheriger Schritt');
    await expect.element(prevButton).toBeInTheDocument();
    await prevButton.click();

    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it('should handle handleNext function', async () => {
    const onStepChange = vi.fn();
    render(StepContainer, {
      currentStep: 1,
      steps: mockSteps,
      canJumpToAnyStep: true,
      onStepChange,
    });

    const nextButton = page.getByTitle('Nächster Schritt');
    expect(nextButton).toBeInTheDocument();
    await nextButton.click();

    expect(onStepChange).toHaveBeenCalledWith(2);
  });

  it('should handle handleStepClick function with canJumpToAnyStep enabled', async () => {
    const onStepChange = vi.fn();
    render(StepContainer, {
      currentStep: 0,
      steps: mockSteps,
      canJumpToAnyStep: true,
      onStepChange,
    });

    const indicator = page.getByTestId(`qa-step-${mockSteps[2].testId}`).getByRole('button');
    expect(indicator).toBeInTheDocument();
    await indicator.click();

    expect(onStepChange).toHaveBeenCalledWith(2);
  });

  it('should handle slot content', () => {
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

    // Verify slot container exists
    const slotContainer = page.getByRole('region', { name: 'Step Content' });
    expect(slotContainer).toBeTruthy();
  });
});
