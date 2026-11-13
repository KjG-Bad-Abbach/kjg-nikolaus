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
  viewBox="0 0 16 16"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
  data-slot="icon"
>
  <path
    clip-rule="evenodd"
    fill-rule="evenodd"
    d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z"
  ></path>
</svg>
