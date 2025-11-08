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
          'size-4',
          'size-5',
          'size-6',
          'size-8',
          'size-10',
          'size-12',
          'size-16',
          'size-24',
        ],
        description: 'Tailwind size class for the spinner',
      },
      colorClass: {
        control: 'select',
        options: ['text-calypso', 'text-atlantis', 'text-java', 'text-white', 'text-gray-400'],
        description: 'Tailwind color class for the spinner',
      },
    },
  });
</script>

<Story name="Playground" args={{ sizeClass: 'size-12', colorClass: 'text-calypso' }} />

<Story name="Default" />

<Story name="Extra Small" args={{ sizeClass: 'size-4' }} />

<Story name="Small" args={{ sizeClass: 'size-6' }} />

<Story name="Medium" args={{ sizeClass: 'size-8' }} />

<Story name="Large" args={{ sizeClass: 'size-12' }} />

<Story name="Extra Large" args={{ sizeClass: 'size-16' }} />

<Story name="Huge" args={{ sizeClass: 'size-24' }} />

<Story name="Green Spinner" args={{ colorClass: 'text-atlantis' }} />

<Story name="Blue Spinner" args={{ colorClass: 'text-java' }} />

<Story name="White Spinner" args={{ colorClass: 'text-white' }}>
  {#snippet template(args: Props)}
    <div class="rounded-sm bg-gray-800 p-8">
      <LoadingSpinner {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Small White Spinner" args={{ sizeClass: 'size-5', colorClass: 'text-white' }}>
  {#snippet template(args: Props)}
    <div class="inline-flex rounded-sm bg-gray-800 p-4">
      <LoadingSpinner {...args} />
    </div>
  {/snippet}
</Story>

<Story name="In Loading Overlay">
  {#snippet template(args: Props)}
    <div class="flex h-64 items-center justify-center bg-gray-100">
      <LoadingSpinner {...args} />
    </div>
  {/snippet}
</Story>

<Story name="In Button" args={{ sizeClass: 'size-5', colorClass: 'text-white' }}>
  {#snippet template(args: Props)}
    <button class="inline-flex items-center gap-2 rounded-sm bg-java px-4 py-2 text-white" disabled>
      <LoadingSpinner {...args} />
      <span>Loading...</span>
    </button>
  {/snippet}
</Story>

<Story name="Inline with Text" args={{ sizeClass: 'size-5' }}>
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
