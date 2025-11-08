<script lang="ts">
  import StepList from './stepper/StepList.svelte';
  import StepNav from './stepper/StepNav.svelte';
  import type { Step } from '$lib/types/booking';
  import type { Snippet } from 'svelte';

  /**
   * Step Container Component
   * Orchestrates the multi-step booking flow with navigation and step indicators
   */
  export type Props = {
    /** Current active step index (0-based) */
    currentStep?: number;
    /** Array of step metadata */
    steps?: Step[];
    /** Whether users can jump to any step */
    canJumpToAnyStep?: boolean;
    /** Callback when step changes */
    onStepChange?: (step: number) => void;
    /** Slot for step content */
    children?: Snippet;
  };

  const {
    currentStep = 0,
    /* v8 ignore next 1 - Svelte 5 runes not properly instrumented by coverage tool */
    steps = [],
    canJumpToAnyStep = false,
    onStepChange,
    children,
  }: Props = $props();

  function handlePrevious() {
    /* v8 ignore next 1 - Handler passed to child component and the guard is duplicate */
    if (currentStep > 0) {
      onStepChange?.(currentStep - 1);
    }
  }

  function handleNext() {
    /* v8 ignore next 1 - Handler passed to child component and the guard is duplicate */
    if (currentStep < steps.length - 1) {
      onStepChange?.(currentStep + 1);
    }
  }

  function handleStepClick(index: number) {
    /* v8 ignore next 1 - Handler passed to child component and the guard is duplicate */
    if (canJumpToAnyStep || index === currentStep) {
      onStepChange?.(index);
    }
  }
</script>

<div data-testid="qa-step-container" class="mx-2 mt-8 mb-4">
  <h2 class="sr-only">Schritte</h2>

  <div class="flex items-center space-x-2 px-2">
    <!-- Navigation -->
    <StepNav
      {currentStep}
      totalSteps={steps.length}
      {canJumpToAnyStep}
      onPrevious={handlePrevious}
      onNext={handleNext}
    />

    <!-- Step Indicators -->
    <StepList {steps} {currentStep} {canJumpToAnyStep} onStepClick={handleStepClick} />
  </div>

  <!-- Slot for step content, summary cards, etc. -->
  <div class="mt-8">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>
