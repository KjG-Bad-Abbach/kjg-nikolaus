<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LoadingSpinner from './LoadingSpinner.svelte';

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

<Story name="Default" args={{}} />

<Story name="Extra Small" args={{ sizeClass: 'size-4' }} />

<Story name="Small" args={{ sizeClass: 'size-6' }} />

<Story name="Medium" args={{ sizeClass: 'size-8' }} />

<Story name="Large" args={{ sizeClass: 'size-12' }} />

<Story name="Extra Large" args={{ sizeClass: 'size-16' }} />

<Story name="Huge" args={{ sizeClass: 'size-24' }} />

<Story name="Green Spinner" args={{ colorClass: 'text-atlantis' }} />

<Story name="Blue Spinner" args={{ colorClass: 'text-java' }} />

<Story name="White Spinner">
  <div class="rounded bg-gray-800 p-8">
    <LoadingSpinner colorClass="text-white" />
  </div>
</Story>

<Story name="Small White Spinner">
  <div class="inline-flex rounded bg-gray-800 p-4">
    <LoadingSpinner sizeClass="size-5" colorClass="text-white" />
  </div>
</Story>

<Story name="In Loading Overlay">
  <div class="flex h-64 items-center justify-center bg-gray-100">
    <LoadingSpinner />
  </div>
</Story>

<Story name="In Button">
  <button class="inline-flex items-center gap-2 rounded bg-java px-4 py-2 text-white" disabled>
    <LoadingSpinner sizeClass="size-5" colorClass="text-white" />
    <span>Loading...</span>
  </button>
</Story>

<Story name="Inline with Text">
  <div class="flex items-center gap-2">
    <LoadingSpinner sizeClass="size-5" />
    <span>Processing your request...</span>
  </div>
</Story>

<Story name="Card Loading State">
  <div class="rounded border border-gray-300 p-6">
    <div class="flex flex-col items-center gap-4">
      <LoadingSpinner sizeClass="size-10" />
      <p class="text-gray-600">Loading your data...</p>
    </div>
  </div>
</Story>
