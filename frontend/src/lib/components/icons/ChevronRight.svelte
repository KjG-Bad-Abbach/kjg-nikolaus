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
    d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
  ></path>
</svg>
