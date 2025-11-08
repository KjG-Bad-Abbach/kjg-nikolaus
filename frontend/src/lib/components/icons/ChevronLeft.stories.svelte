<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChevronLeft from './ChevronLeft.svelte';
  import type { Props } from './ChevronLeft.svelte';

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

<Story name="Default" />

<Story name="Extra Small" args={{ sizeClass: 'size-4' }} />

<Story name="Small" args={{ sizeClass: 'size-6' }} />

<Story name="Medium" args={{ sizeClass: 'size-8' }} />

<Story name="Large" args={{ sizeClass: 'size-12' }} />

<Story name="Extra Large" args={{ sizeClass: 'size-16' }} />

<Story name="With Custom Color" args={{ sizeClass: 'size-10' }}>
  {#snippet template(args: Props)}
    <div class="text-atlantis">
      <ChevronLeft {...args} />
    </div>
  {/snippet}
</Story>

<Story name="In Navigation Button" args={{ sizeClass: 'size-5' }}>
  {#snippet template(args: Props)}
    <button
      class="inline-flex items-center gap-2 rounded-sm bg-java px-4 py-2 text-white hover:bg-java-700"
    >
      <ChevronLeft {...args} />
      <span>Previous</span>
    </button>
  {/snippet}
</Story>

<Story name="In Pagination" args={{ sizeClass: 'size-5' }}>
  {#snippet template(args: Props)}
    <div class="flex gap-2">
      <button
        class="flex size-8 items-center justify-center rounded-sm border border-gray-300 hover:bg-gray-100"
      >
        <ChevronLeft {...args} />
      </button>
      <div class="flex items-center px-2">Page 2 of 10</div>
    </div>
  {/snippet}
</Story>
