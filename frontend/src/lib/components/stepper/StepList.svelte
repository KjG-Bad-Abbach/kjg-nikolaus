<script lang="ts">
  import type { Step } from '$lib/types/booking';
  import StepIndicator from './StepIndicator.svelte';

  // Props matching the Alpine.js implementation
  let {
    steps,
    currentStep,
    canJumpToAnyStep = false,
    onStepClick,
  }: {
    steps: Step[];
    currentStep: number;
    canJumpToAnyStep?: boolean;
    onStepClick?: (index: number) => void;
  } = $props();

  function handleStepClick(index: number) {
    if (onStepClick) {
      onStepClick(index);
    }
  }
</script>

<!--
  Based on lines 134-195 in frontend-alpine.js/src/index.html
  Horizontal progress bar with step indicators
-->
<div
  class="relative flex-grow after:absolute after:inset-x-0 after:top-1/2 after:block after:h-0.5 after:-translate-y-1/2 after:rounded-lg after:bg-java-500"
>
  <ol
    data-testid="qa-stepper"
    class="relative z-10 flex justify-between text-sm font-medium text-calypso"
  >
    {#each steps as step, index (step.testId)}
      <StepIndicator
        {index}
        name={step.name}
        testId={step.testId}
        isCurrent={currentStep === index}
        allFilled={step.allFilled}
        canJumpTo={canJumpToAnyStep || currentStep === index}
        onClick={handleStepClick}
      />
    {/each}
  </ol>
</div>
