<script lang="ts">
  import CheckIcon from '../icons/CheckIcon.svelte';

  export type Props = {
    index: number;
    name: string;
    testId?: string;
    isCurrent?: boolean;
    allFilled?: boolean;
    canJumpTo?: boolean;
    onClick?: (index: number) => void;
  };

  // Props matching the Alpine.js implementation
  const {
    index,
    name,
    testId = '',
    isCurrent = false,
    allFilled = false,
    canJumpTo = false,
    onClick,
  }: Props = $props();

  function handleClick() {
    if (onClick) {
      onClick(index);
    }
  }
</script>

<!--
  Based on lines 143-193 in frontend-alpine.js/src/index.html
  Individual step indicator with number/checkmark
-->
<li class="group bg-java" data-testid={testId ? `qa-step-${testId}` : undefined}>
  <button
    type="button"
    onclick={handleClick}
    class="flex w-full items-center gap-1 p-1 select-none"
    class:hover:text-calypso-950={canJumpTo || isCurrent}
    class:cursor-pointer={canJumpTo || isCurrent}
    class:cursor-not-allowed={!canJumpTo && !isCurrent}
    disabled={!canJumpTo && !isCurrent}
    aria-label={name}
    title={name}
  >
    <span
      class="size-8 rounded-full border-4 text-center text-[10px]/6 font-bold"
      class:bg-calypso={allFilled || isCurrent}
      class:group-hover:bg-calypso-950={(allFilled || isCurrent) && (canJumpTo || isCurrent)}
      class:text-calypso-500={allFilled || isCurrent}
      class:bg-java-500={!allFilled && !isCurrent}
      class:border-calypso-950={isCurrent}
      class:border-java={!isCurrent}
    >
      {#if !allFilled}
        <span>{index + 1}</span>
      {:else}
        <span>
          <CheckIcon sizeClass="size-4" class="m-1" />
        </span>
      {/if}
    </span>
    <span class="hidden sm:block">{name}</span>
  </button>
</li>
