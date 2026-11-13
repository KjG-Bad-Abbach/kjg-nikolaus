import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StepNav from './StepNav.svelte';

describe('StepNav', () => {
  it('should render previous and next buttons when canJumpToAnyStep is true', async () => {
    render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const prevButton = page.getByLabelText('Vorheriger Schritt');
    const nextButton = page.getByLabelText('Nächster Schritt');

    await expect.element(prevButton).toBeInTheDocument();
    await expect.element(nextButton).toBeInTheDocument();
  });

  it('should hide buttons when canJumpToAnyStep is false', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: false,
    });

    const buttons = container.querySelectorAll('button');
    expect(buttons[0]?.classList.contains('hidden')).toBe(true);
    expect(buttons[1]?.classList.contains('hidden')).toBe(true);
  });

  it('should disable previous button on first step', async () => {
    const { container } = render(StepNav, {
      currentStep: 0,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const prevButton = container.querySelectorAll('button')[0];
    expect(prevButton?.hasAttribute('disabled')).toBe(true);
  });

  it('should disable next button on last step', async () => {
    const { container } = render(StepNav, {
      currentStep: 4,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const nextButton = container.querySelectorAll('button')[1];
    expect(nextButton?.hasAttribute('disabled')).toBe(true);
  });

  it('should enable previous button when not on first step', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const prevButton = container.querySelectorAll('button')[0];
    expect(prevButton?.hasAttribute('disabled')).toBe(false);
  });

  it('should enable next button when not on last step', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const nextButton = container.querySelectorAll('button')[1];
    expect(nextButton?.hasAttribute('disabled')).toBe(false);
  });

  it('should call onPrevious when previous button is clicked and enabled', async () => {
    const onPrevious = vi.fn();
    render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
      onPrevious,
    });

    const prevButton = page.getByLabelText('Vorheriger Schritt');
    await prevButton.click();

    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it('should call onNext when next button is clicked and enabled', async () => {
    const onNext = vi.fn();
    render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
      onNext,
    });

    const nextButton = page.getByLabelText('Nächster Schritt');
    await nextButton.click();

    expect(onNext).toHaveBeenCalledOnce();
  });

  it('should not call onPrevious when previous button is disabled (on first step)', async () => {
    const onPrevious = vi.fn();
    const { container } = render(StepNav, {
      currentStep: 0,
      totalSteps: 5,
      canJumpToAnyStep: true,
      onPrevious,
    });

    const prevButton = container.querySelectorAll('button')[0];
    await prevButton?.click();

    expect(onPrevious).not.toHaveBeenCalled();
  });

  it('should not call onNext when next button is disabled (on last step)', async () => {
    const onNext = vi.fn();
    const { container } = render(StepNav, {
      currentStep: 4,
      totalSteps: 5,
      canJumpToAnyStep: true,
      onNext,
    });

    const nextButton = container.querySelectorAll('button')[1];
    nextButton?.click();

    expect(onNext).not.toHaveBeenCalled();
  });

  it('should have correct aria labels and titles', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const buttons = container.querySelectorAll('button');
    expect(buttons[0]?.getAttribute('aria-label')).toBe('Vorheriger Schritt');
    expect(buttons[1]?.getAttribute('aria-label')).toBe('Nächster Schritt');
    expect(buttons[0]?.getAttribute('title')).toBe('Vorheriger Schritt');
    expect(buttons[1]?.getAttribute('title')).toBe('Nächster Schritt');
  });

  it('should not crash when onPrevious is not provided', async () => {
    render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const prevButton = page.getByLabelText('Vorheriger Schritt');
    await prevButton.click();

    await expect.element(prevButton).toBeInTheDocument();
  });

  it('should not crash when onNext is not provided', async () => {
    render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const nextButton = page.getByLabelText('Nächster Schritt');
    await nextButton.click();

    await expect.element(nextButton).toBeInTheDocument();
  });

  it('should render without children slot', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    // Both buttons should be rendered
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });
});
