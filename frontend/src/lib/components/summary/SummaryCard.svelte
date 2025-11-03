<script lang="ts">
  import EditIcon from '$lib/components/icons/EditIcon.svelte';

  /**
   * Reusable summary card component with title and edit button
   * Provides consistent layout for summary displays across booking steps
   */
  let {
    title,
    onEdit,
    children,
  }: {
    /** Card title displayed in header */
    title: string;
    /** Callback when edit button is clicked */
    onEdit: () => void;
    /** Content to display in the card body */
    children?: import('svelte').Snippet;
  } = $props();
</script>

<div class="text-left">
  <h3 class="flex items-center text-lg font-medium text-calypso">
    <span>{title}</span>
    <span
      class="ml-2 size-6 cursor-pointer"
      onclick={onEdit}
      title="Bearbeiten"
      role="button"
      tabindex="0"
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit();
        }
      }}
    >
      <EditIcon />
    </span>
  </h3>
  {#if children}
    {@render children()}
  {/if}
</div>
