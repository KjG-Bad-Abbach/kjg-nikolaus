<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface ButtonProps extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary';
    fullWidth?: boolean;
    children: Snippet;
  }

  let {
    variant = 'primary',
    fullWidth = false,
    disabled = false,
    type = 'button',
    class: className = '',
    children,
    ...restProps
  }: ButtonProps = $props();

  const baseClasses =
    'rounded-sm px-4 py-2 font-bold focus:ring-2 focus:outline-hidden focus:ring-java focus:ring-opacity-50';

  const variantClasses = {
    primary: disabled
      ? 'bg-atlantis text-white opacity-50 cursor-not-allowed'
      : 'bg-atlantis hover:bg-surfie-green text-white',
    secondary: disabled
      ? 'text-calypso opacity-50 cursor-not-allowed'
      : 'text-calypso hover:text-calypso-950',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClasses =
    `${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`.trim();
</script>

<button {type} {disabled} class={combinedClasses} {...restProps}>
  {@render children()}
</button>
