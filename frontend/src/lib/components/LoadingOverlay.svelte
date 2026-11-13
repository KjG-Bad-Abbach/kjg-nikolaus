<script lang="ts">
  import LoadingSpinner from './icons/LoadingSpinner.svelte';

  /**
   * LoadingOverlay Component
   *
   * Displays a loading spinner centered in the page
   * Conditionally rendered based on isLoading prop
   */

  export type Props = {
    isLoading: boolean;
  };

  const { isLoading }: Props = $props();
</script>

{#if isLoading}
  <div data-testid="qa-loading" class="my-8 flex items-center justify-center">
    <LoadingSpinner sizeClass="size-12" colorClass="text-calypso" />
  </div>
{/if}
