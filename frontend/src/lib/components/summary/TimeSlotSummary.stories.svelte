<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TimeSlotSummary from './TimeSlotSummary.svelte';

  const { Story } = defineMeta({
    component: TimeSlotSummary,
    title: 'Components/Summary/TimeSlotSummary',
    tags: ['autodocs'],
    argTypes: {
      onEdit: { action: 'edit' },
      selectedTimeSlots: { control: 'object' },
      maxTimeSlots: { control: 'number' },
      routePlanningDeadline: { control: 'date' },
    },
  });

  const routePlanningDeadline = new Date('2024-12-05T19:30:00+01:00');
  const maxTimeSlots = 3;

  const timeSlots = [
    {
      id: '1',
      documentId: 'doc1',
      start: '2024-12-05T19:30:00+01:00',
      end: '2024-12-05T20:30:00+01:00',
      label: 'Fr 5.12. 19:30 - 20:30 Uhr',
    },
    {
      id: '2',
      documentId: 'doc2',
      start: '2024-12-05T20:30:00+01:00',
      end: '2024-12-05T21:30:00+01:00',
      label: 'Fr 5.12. 20:30 - 21:30 Uhr',
    },
    {
      id: '3',
      documentId: 'doc3',
      start: '2024-12-05T21:30:00+01:00',
      end: '2024-12-05T22:30:00+01:00',
      label: 'Fr 5.12. 21:30 - 22:30 Uhr',
    },
  ];

  const manyTimeSlots = [
    ...timeSlots,
    {
      id: '4',
      documentId: 'doc4',
      start: '2024-12-06T17:00:00+01:00',
      end: '2024-12-06T18:00:00+01:00',
      label: 'Sa 6.12. 17:00 - 18:00 Uhr',
    },
    {
      id: '5',
      documentId: 'doc5',
      start: '2024-12-06T18:00:00+01:00',
      end: '2024-12-06T19:00:00+01:00',
      label: 'Sa 6.12. 18:00 - 19:00 Uhr',
    },
  ];
</script>

<Story
  name="Playground"
  args={{
    selectedTimeSlots: timeSlots,
    maxTimeSlots,
    routePlanningDeadline,
  }}
/>

<Story
  name="All Slots Selected (3 of 3)"
  args={{
    selectedTimeSlots: timeSlots,
    maxTimeSlots,
    routePlanningDeadline,
  }}
/>

<Story
  name="One Slot Selected (1 of 3)"
  args={{
    selectedTimeSlots: [timeSlots[0]],
    maxTimeSlots,
    routePlanningDeadline,
  }}
/>

<Story
  name="No Slots Selected (0 of 3)"
  args={{
    selectedTimeSlots: [],
    maxTimeSlots,
    routePlanningDeadline,
  }}
/>

<Story
  name="Two Slots Selected (2 of 3)"
  args={{
    selectedTimeSlots: [timeSlots[0], timeSlots[1]],
    maxTimeSlots,
    routePlanningDeadline,
  }}
/>

<Story
  name="Many Slots - 5 Selected (maxTimeSlots 5)"
  args={{
    selectedTimeSlots: manyTimeSlots,
    maxTimeSlots: 5,
    routePlanningDeadline,
  }}
/>

<Story
  name="Many Slots - Incomplete (3 of 5)"
  args={{
    selectedTimeSlots: timeSlots,
    maxTimeSlots: 5,
    routePlanningDeadline,
  }}
/>

<Story
  name="Single Slot System - Complete (1 of 1)"
  args={{
    selectedTimeSlots: [timeSlots[0]],
    maxTimeSlots: 1,
    routePlanningDeadline,
  }}
/>

<Story
  name="Single Slot System - Empty (0 of 1)"
  args={{
    selectedTimeSlots: [],
    maxTimeSlots: 1,
    routePlanningDeadline,
  }}
/>
