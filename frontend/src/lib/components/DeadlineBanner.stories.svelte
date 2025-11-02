<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DeadlineBanner from './DeadlineBanner.svelte';

  const { Story } = defineMeta({
    component: DeadlineBanner,
    title: 'Components/DeadlineBanner',
    tags: ['autodocs'],
  });

  const routePlanningDeadline = new Date('2024-12-05T19:30:00+01:00');
  const finalDeadline = new Date('2024-12-20T23:59:00+01:00');
</script>

<Story
  name="Both Active"
  args={{
    routePlanningDeadline,
    finalDeadline,
    canEditRoutePlanning: true,
    canEditAnything: true,
  }}
/>

<Story
  name="Route Planning Deadline Passed"
  args={{
    routePlanningDeadline,
    finalDeadline,
    canEditRoutePlanning: false,
    canEditAnything: true,
  }}
/>

<Story
  name="Both Deadlines Passed"
  args={{
    routePlanningDeadline,
    finalDeadline,
    canEditRoutePlanning: false,
    canEditAnything: false,
  }}
/>

<Story
  name="Future Deadlines"
  args={{
    routePlanningDeadline: new Date('2025-12-05T19:30:00+01:00'),
    finalDeadline: new Date('2025-12-20T23:59:00+01:00'),
    canEditRoutePlanning: true,
    canEditAnything: true,
  }}
/>

<Story name="In Context">
  <div class="max-w-4xl rounded-lg bg-white p-6 shadow-md">
    <h1 class="mb-4 text-3xl font-bold text-surfie-green">KjG Nikolaus Buchung</h1>
    <DeadlineBanner
      {routePlanningDeadline}
      {finalDeadline}
      canEditRoutePlanning={true}
      canEditAnything={true}
    />
    <div class="mt-6">
      <p class="text-gray-600">Content would go here...</p>
    </div>
  </div>
</Story>
