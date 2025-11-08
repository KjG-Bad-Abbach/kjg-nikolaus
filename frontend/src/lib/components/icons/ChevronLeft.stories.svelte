<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChevronLeft from './ChevronLeft.svelte';

  const { Story } = defineMeta({
    component: ChevronLeft,
    title: 'Components/Icons/ChevronLeft',
    tags: ['autodocs'],
    argTypes: {
      sizeClass: {
        control: 'select',
        options: ['size-4', 'size-5', 'size-6', 'size-8', 'size-10', 'size-12', 'size-16'],
        description: 'Tailwind size class for the icon',
      },
    },
  });
</script>

<Story name="Playground" args={{ sizeClass: 'size-8' }} />

<Story name="Default" args={{}} />

<Story name="Extra Small" args={{ sizeClass: 'size-4' }} />

<Story name="Small" args={{ sizeClass: 'size-6' }} />

<Story name="Medium" args={{ sizeClass: 'size-8' }} />

<Story name="Large" args={{ sizeClass: 'size-12' }} />

<Story name="Extra Large" args={{ sizeClass: 'size-16' }} />

<Story name="With Custom Color">
  <div class="text-atlantis">
    <ChevronLeft sizeClass="size-10" />
  </div>
</Story>

<Story name="In Navigation Button">
  <button
    class="inline-flex items-center gap-2 rounded-sm bg-java px-4 py-2 text-white hover:bg-java-700"
  >
    <ChevronLeft sizeClass="size-5" />
    <span>Previous</span>
  </button>
</Story>

<Story name="In Pagination">
  <div class="flex gap-2">
    <button
      class="flex size-8 items-center justify-center rounded-sm border border-gray-300 hover:bg-gray-100"
    >
      <ChevronLeft sizeClass="size-5" />
    </button>
    <div class="flex items-center px-2">Page 2 of 10</div>
  </div>
</Story>
