<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  export interface Props extends HTMLInputAttributes {
    label?: string;
    id: string;
  }

  const {
    label,
    id,
    checked = false,
    disabled = false,
    class: className = '',
    ...restProps
  }: Props = $props();

  const baseClasses = 'form-checkbox peer text-calypso h-5 w-5';
  const combinedClasses = $derived(`${baseClasses} ${className}`.trim());
</script>

<div class="flex items-center">
  <input type="checkbox" {id} {checked} {disabled} class={combinedClasses} {...restProps} />
  {#if label}
    <label for={id} class="ml-2 text-gray-800 select-none peer-disabled:text-gray-300">
      {label}
    </label>
  {/if}
</div>
