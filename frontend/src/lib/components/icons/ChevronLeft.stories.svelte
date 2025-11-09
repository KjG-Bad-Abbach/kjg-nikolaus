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
        options: [
          'size-3',
          'size-4',
          'size-5',
          'size-6',
          'size-8',
          'size-10',
          'size-12',
          'size-16',
        ],
        description: 'Tailwind size class for the icon',
      },
      colorClass: {
        control: 'select',
        options: [
          'text-java',
          'text-calypso',
          'text-flush-orange',
          'text-camelot',
          'text-brink-pink',
          'text-bossanova',
          'text-atlantis',
          'text-surfie-green',
          'text-sun',
          'text-rust',
        ],
        description: 'Tailwind color class for the icon',
      },
      class: { control: 'text', description: 'Additional classes for the icon' },
    },
  });
</script>

<Story name="Playground" />

<Story name="Default" />

<Story name="Extra Small" args={{ sizeClass: 'size-3' }} />

<Story name="Small" args={{ sizeClass: 'size-4' }} />

<Story name="Medium" />

<Story name="Large" args={{ sizeClass: 'size-12' }} />

<Story name="Extra Large" args={{ sizeClass: 'size-16' }} />

<Story name="With Color" args={{ colorClass: 'text-atlantis' }} />

<Story name="In Navigation Button">
  {#snippet template(args: Props)}
    <button
      class="inline-flex items-center gap-2 rounded-sm bg-java px-4 py-2 text-white hover:bg-java-700"
    >
      <ChevronLeft {...args} />
      <span>Previous</span>
    </button>
  {/snippet}
</Story>

<Story name="In Pagination">
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
