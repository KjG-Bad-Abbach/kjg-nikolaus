<script lang="ts">
  import ChevronLeft from '../icons/ChevronLeft.svelte';
  import ChevronRight from '../icons/ChevronRight.svelte';
  import type { Snippet } from 'svelte';

  // Props matching the Alpine.js implementation
  let {
    currentStep,
    totalSteps,
    canJumpToAnyStep = false,
    onPrevious,
    onNext,
    children,
  }: {
    currentStep: number;
    totalSteps: number;
    canJumpToAnyStep?: boolean;
    onPrevious?: () => void;
    onNext?: () => void;
    children?: Snippet;
  } = $props();

  // Derived states
  const isFirstStep = $derived(currentStep <= 0);
  const isLastStep = $derived(currentStep >= totalSteps - 1);

  function handlePrevious() {
    if (!isFirstStep && onPrevious) {
      onPrevious();
    }
  }

  function handleNext() {
    if (!isLastStep && onNext) {
      onNext();
    }
  }
</script>

<!--
  Based on lines 104-224 in frontend-alpine.js/src/index.html
  Navigation container with Previous/Next buttons and step list
-->
<div class="flex w-full max-w-5xl items-center gap-2">
  <!-- Previous Step Button -->
  <button
    onclick={handlePrevious}
    class="focus:ring-opacity-50 flex-none cursor-pointer py-2 font-bold text-calypso select-none focus:ring-2 focus:ring-java-500 focus:outline-hidden"
    class:hidden={!canJumpToAnyStep}
    class:opacity-50={isFirstStep}
    class:cursor-not-allowed={isFirstStep}
    class:hover:text-calypso-950={!isFirstStep}
    disabled={isFirstStep}
    aria-hidden="true"
    aria-label="Vorheriger Schritt"
    title="Vorheriger Schritt"
  >
    <ChevronLeft sizeClass="size-8" />
  </button>

  <!-- Slot for StepList component -->
  {#if children}
    {@render children()}
  {/if}

  <!-- Next Step Button -->
  <button
    onclick={handleNext}
    class="focus:ring-opacity-50 flex-none cursor-pointer py-2 font-bold text-calypso select-none focus:ring-2 focus:ring-java-500 focus:outline-hidden"
    class:hidden={!canJumpToAnyStep}
    class:opacity-50={isLastStep}
    class:cursor-not-allowed={isLastStep}
    class:hover:text-calypso-950={!isLastStep}
    disabled={isLastStep}
    aria-hidden="true"
    aria-label="Nächster Schritt"
    title="Nächster Schritt"
  >
    <ChevronRight sizeClass="size-8" />
  </button>
</div>
