<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import type { Props } from './LoadingSpinner.svelte';

  const { Story } = defineMeta({
    component: LoadingSpinner,
    title: 'Components/Icons/LoadingSpinner',
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

<Story name="In Loading Overlay">
  {#snippet template(args: Props)}
    <div class="flex h-64 items-center justify-center bg-gray-100">
      <LoadingSpinner {...args} />
    </div>
  {/snippet}
</Story>

<Story name="In Button" args={{ colorClass: 'text-white' }}>
  {#snippet template(args: Props)}
    <button class="inline-flex items-center gap-2 rounded-sm bg-java px-4 py-2 text-white" disabled>
      <LoadingSpinner {...args} />
      <span>Loading...</span>
    </button>
  {/snippet}
</Story>

<Story name="Inline with Text">
  {#snippet template(args: Props)}
    <div class="flex items-center gap-2">
      <LoadingSpinner {...args} />
      <span>Processing your request...</span>
    </div>
  {/snippet}
</Story>

<Story name="Card Loading State" args={{ sizeClass: 'size-10' }}>
  {#snippet template(args: Props)}
    <div class="rounded-sm border border-gray-300 p-6">
      <div class="flex flex-col items-center gap-4">
        <LoadingSpinner {...args} />
        <p class="text-gray-600">Loading your data...</p>
      </div>
    </div>
  {/snippet}
</Story>
