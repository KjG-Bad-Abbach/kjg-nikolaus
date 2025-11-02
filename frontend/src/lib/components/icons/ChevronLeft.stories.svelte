<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChevronLeft from './ChevronLeft.svelte';

  const { Story } = defineMeta({
    component: ChevronLeft,
    title: 'Components/Icons/ChevronLeft',
    tags: ['autodocs'],
  });
</script>

<Story name="Default" args={{}} />

<Story name="Large" args={{ sizeClass: 'size-16' }} />

<Story name="Small" args={{ sizeClass: 'size-4' }} />

<Story name="In Button Context">
  <button class="rounded bg-java px-4 py-2 text-white hover:bg-java-700">
    <ChevronLeft />
  </button>
</Story>
