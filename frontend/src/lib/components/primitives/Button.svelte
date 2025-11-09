<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  export interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary';
    fullWidth?: boolean;
    children?: Snippet;
  }

  const {
    variant = 'primary',
    fullWidth = false,
    disabled = false,
    type = 'button',
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  const baseClasses =
    'rounded-sm px-4 py-2 font-bold focus:ring-2 focus:outline-hidden focus:ring-java/50';

  const variantClasses = $derived({
    primary: disabled
      ? 'bg-atlantis text-white opacity-50 cursor-not-allowed'
      : 'bg-atlantis hover:bg-surfie-green text-white',
    secondary: disabled
      ? 'text-calypso opacity-50 cursor-not-allowed'
      : 'text-calypso hover:text-calypso-950',
  });

  const widthClass = $derived(fullWidth ? 'w-full' : '');

  const combinedClasses = $derived(
    `${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`.trim(),
  );
</script>

<button {type} {disabled} class={combinedClasses} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</button>
