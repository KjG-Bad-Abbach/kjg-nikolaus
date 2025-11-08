<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChevronRight from './ChevronRight.svelte';
  import type { Props } from './ChevronRight.svelte';

  const { Story } = defineMeta({
    component: ChevronRight,
    title: 'Components/Icons/ChevronRight',
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
    <div class="text-java">
      <ChevronRight {...args} />
    </div>
  {/snippet}
</Story>

<Story name="In Navigation Button" args={{ sizeClass: 'size-5' }}>
  {#snippet template(args: Props)}
    <button
      class="inline-flex items-center gap-2 rounded-sm bg-java px-4 py-2 text-white hover:bg-java-700"
    >
      <span>Next</span>
      <ChevronRight {...args} />
    </button>
  {/snippet}
</Story>

<Story name="In List Item" args={{ sizeClass: 'size-5' }}>
  {#snippet template(args: Props)}
    <div
      class="flex items-center justify-between rounded-sm border border-gray-300 p-3 hover:bg-gray-50"
    >
      <span>View details</span>
      <div class="text-gray-400">
        <ChevronRight {...args} />
      </div>
    </div>
  {/snippet}
</Story>
