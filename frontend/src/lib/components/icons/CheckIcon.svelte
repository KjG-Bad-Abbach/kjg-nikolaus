<script lang="ts">
  export type Props = {
    sizeClass?: `size-${number}`;
    colorClass?: `text-${string}`;
    class?: string;
  };

  const { sizeClass = 'size-6', colorClass, class: additionalClasses }: Props = $props();

  const combinedClasses = $derived(
    [sizeClass, colorClass, additionalClasses].filter(Boolean).join(' '),
  );
</script>

<svg
  class={combinedClasses}
  fill="currentColor"
  viewBox="0 0 20 20"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
  data-slot="icon"
>
  <path
    clip-rule="evenodd"
    fill-rule="evenodd"
    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
  />
</svg>
