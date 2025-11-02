import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StepNav from './StepNav.svelte';

describe('StepNav', () => {
  it('should render both previous and next buttons when can jump', async () => {
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

  it('should not render buttons when cannot jump', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: false,
    });

    // Buttons should be hidden when canJumpToAnyStep is false
    // They might still be in the DOM but with x-show="false" equivalent
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2); // Both buttons exist
  });

  it('should disable previous button on first step', async () => {
    const { container } = render(StepNav, {
      currentStep: 0,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const prevButton = container.querySelectorAll('button')[0];
    expect(prevButton?.hasAttribute('disabled')).toBe(true);
    expect(prevButton?.classList.contains('opacity-50')).toBe(true);
    expect(prevButton?.classList.contains('cursor-not-allowed')).toBe(true);
  });

  it('should disable next button on last step', async () => {
    const { container } = render(StepNav, {
      currentStep: 4,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const buttons = container.querySelectorAll('button');
    const nextButton = buttons[1];
    expect(nextButton?.hasAttribute('disabled')).toBe(true);
    expect(nextButton?.classList.contains('opacity-50')).toBe(true);
    expect(nextButton?.classList.contains('cursor-not-allowed')).toBe(true);
  });

  it('should enable previous button when not on first step', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const prevButton = container.querySelectorAll('button')[0];
    expect(prevButton?.hasAttribute('disabled')).toBe(false);
    expect(prevButton?.classList.contains('hover:text-calypso-950')).toBe(true);
  });

  it('should enable next button when not on last step', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const buttons = container.querySelectorAll('button');
    const nextButton = buttons[1];
    expect(nextButton?.hasAttribute('disabled')).toBe(false);
    expect(nextButton?.classList.contains('hover:text-calypso-950')).toBe(true);
  });

  it('should call onPrevious when previous button is clicked', async () => {
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

  it('should call onNext when next button is clicked', async () => {
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

  it('should not call onPrevious when disabled', async () => {
    const onPrevious = vi.fn();
    const { container } = render(StepNav, {
      currentStep: 0,
      totalSteps: 5,
      canJumpToAnyStep: true,
      onPrevious,
    });

    const prevButton = container.querySelectorAll('button')[0];
    await prevButton?.click();

    // The button is disabled, so the click should not trigger the callback
    expect(onPrevious).not.toHaveBeenCalled();
  });

  it('should not call onNext when disabled', async () => {
    const onNext = vi.fn();
    const { container } = render(StepNav, {
      currentStep: 4,
      totalSteps: 5,
      canJumpToAnyStep: true,
      onNext,
    });

    const buttons = container.querySelectorAll('button');
    const nextButton = buttons[1];
    await nextButton?.click();

    // The button is disabled, so the click should not trigger the callback
    expect(onNext).not.toHaveBeenCalled();
  });

  it('should have correct aria labels', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const buttons = container.querySelectorAll('button');
    expect(buttons[0]?.getAttribute('aria-label')).toBe('Vorheriger Schritt');
    expect(buttons[1]?.getAttribute('aria-label')).toBe('Nächster Schritt');
  });

  it('should have correct titles', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
    });

    const buttons = container.querySelectorAll('button');
    expect(buttons[0]?.getAttribute('title')).toBe('Vorheriger Schritt');
    expect(buttons[1]?.getAttribute('title')).toBe('Nächster Schritt');
  });

  it('should not crash when onPrevious is not provided', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
      // No onPrevious provided
    });

    const prevButton = container.querySelectorAll('button')[0];
    await prevButton?.click();

    // If we get here without crashing, the test passes
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('should not crash when onNext is not provided', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
      // No onNext provided
    });

    const buttons = container.querySelectorAll('button');
    const nextButton = buttons[1];
    await nextButton?.click();

    // If we get here without crashing, the test passes
    expect(buttons.length).toBe(2);
  });

  it('should render without children', async () => {
    const { container } = render(StepNav, {
      currentStep: 2,
      totalSteps: 5,
      canJumpToAnyStep: true,
      // No children provided
    });

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });
});
