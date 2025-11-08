<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LoadingOverlay from './LoadingOverlay.svelte';
  import type { Props } from './LoadingOverlay.svelte';

  const { Story } = defineMeta({
    component: LoadingOverlay,
    title: 'Components/LoadingOverlay',
    tags: ['autodocs'],
    args: {
      isLoading: true,
    },
  });
</script>

<Story name="Playground" />

<Story name="Loading" />

<Story name="Not Loading" args={{ isLoading: false }} />

<Story name="In Context">
  {#snippet template(args: Props)}
    <div class="min-h-[400px] rounded-lg bg-white p-6 shadow-md">
      <h2 class="mb-4 text-2xl font-bold text-surfie-green">Booking Form</h2>
      <p class="mb-4 text-gray-600">This simulates a loading state during form submission...</p>
      <LoadingOverlay {...args} />
      <div class="text-gray-400">
        <p>Form content would be here</p>
        <p>Form content would be here</p>
        <p>Form content would be here</p>
      </div>
    </div>
  {/snippet}
</Story>
