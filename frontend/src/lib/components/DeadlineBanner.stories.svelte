<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DeadlineBanner from './DeadlineBanner.svelte';
  import type { Props } from './DeadlineBanner.svelte';

  const routePlanningDeadline = new Date('2024-12-05T19:30:00+01:00');
  const finalDeadline = new Date('2024-12-20T23:59:00+01:00');

  const { Story } = defineMeta({
    component: DeadlineBanner,
    title: 'Components/DeadlineBanner',
    tags: ['autodocs'],
    args: {
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
    },
  });
</script>

<Story name="Playground" />

<Story name="Both Active" />

<Story
  name="Route Planning Deadline Passed"
  args={{
    canEditRoutePlanning: false,
  }}
/>

<Story
  name="Both Deadlines Passed"
  args={{
    canEditRoutePlanning: false,
    canEditAnything: false,
  }}
/>

<Story
  name="Future Deadlines"
  args={{
    routePlanningDeadline: new Date('2025-12-05T19:30:00+01:00'),
    finalDeadline: new Date('2025-12-20T23:59:00+01:00'),
  }}
/>

<Story name="In Context">
  {#snippet template(args: Props)}
    <div class="max-w-4xl rounded-lg bg-white p-6 shadow-md">
      <h1 class="mb-4 text-3xl font-bold text-surfie-green">KjG Nikolaus Buchung</h1>
      <DeadlineBanner {...args} />
      <div class="mt-6">
        <p class="text-gray-600">Content would go here...</p>
      </div>
    </div>
  {/snippet}
</Story>
