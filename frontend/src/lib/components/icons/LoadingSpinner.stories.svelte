<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LoadingSpinner from './LoadingSpinner.svelte';

  const { Story } = defineMeta({
    component: LoadingSpinner,
    title: 'Components/Icons/LoadingSpinner',
    tags: ['autodocs'],
  });
</script>

<Story name="Default" args={{}} />

<Story name="Large" args={{ sizeClass: 'size-16' }} />

<Story name="Small" args={{ sizeClass: 'size-6' }} />

<Story name="Custom Color" args={{ colorClass: 'text-atlantis' }} />

<!-- Demo in context -->
<Story name="In Loading Overlay">
  <div class="flex h-64 items-center justify-center bg-gray-100">
    <LoadingSpinner />
  </div>
</Story>
