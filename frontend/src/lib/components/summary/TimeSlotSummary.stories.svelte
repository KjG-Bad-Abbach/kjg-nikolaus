<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TimeSlotSummary from './TimeSlotSummary.svelte';

  const { Story } = defineMeta({
    component: TimeSlotSummary,
    title: 'Components/Summary/TimeSlotSummary',
    tags: ['autodocs'],
    argTypes: {
      onEdit: { action: 'edit' },
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
</script>

<Story
  name="Complete (3 of 3)"
  args={{
    selectedTimeSlots: timeSlots,
    maxTimeSlots,
    routePlanningDeadline,
  }}
/>

<Story
  name="Incomplete (1 of 3)"
  args={{
    selectedTimeSlots: [timeSlots[0]],
    maxTimeSlots,
    routePlanningDeadline,
  }}
/>

<Story
  name="Empty (0 of 3)"
  args={{
    selectedTimeSlots: [],
    maxTimeSlots,
    routePlanningDeadline,
  }}
/>

<Story
  name="Partial (2 of 3)"
  args={{
    selectedTimeSlots: [timeSlots[0], timeSlots[1]],
    maxTimeSlots,
    routePlanningDeadline,
  }}
/>
