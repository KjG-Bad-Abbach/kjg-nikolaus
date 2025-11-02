<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * FormField Component
   *
   * A reusable form field wrapper that includes:
   * - Label with consistent styling
   * - Slot for input/textarea/select components
   * - Validation error display
   */

  let {
    label,
    htmlFor,
    errors = [],
    testId,
    children,
  }: {
    label: string;
    htmlFor: string;
    errors?: string[];
    testId?: string;
    children?: Snippet;
  } = $props();
</script>

<div data-testid={testId}>
  <label for={htmlFor} class="block text-left font-medium text-surfie-green">
    {label}
  </label>
  {#if children}
    {@render children()}
  {/if}
  {#each errors as error, index (index)}
    <div class="mx-2 mt-2 text-left text-sm text-rust">
      {error}
    </div>
  {/each}
</div>
