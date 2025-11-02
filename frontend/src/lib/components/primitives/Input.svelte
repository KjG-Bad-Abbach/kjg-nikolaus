<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface InputProps extends HTMLInputAttributes {
    label: string;
    id: string;
    error?: string;
  }

  let {
    label,
    id,
    type = 'text',
    error = '',
    readonly = false,
    class: className = '',
    ...restProps
  }: InputProps = $props();

  const baseClasses =
    'mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-atlantis focus:ring-atlantis';
  const errorClass = error ? 'border-rust' : 'border-gray-300';
  const combinedClasses = `${baseClasses} ${errorClass} ${className}`.trim();
</script>

<div class="space-y-1">
  <label for={id} class="block text-sm font-medium text-gray-700">
    {label}
  </label>
  <input {id} {type} {readonly} class={combinedClasses} {...restProps} />
  {#if error}
    <p class="text-sm text-rust">{error}</p>
  {/if}
</div>
