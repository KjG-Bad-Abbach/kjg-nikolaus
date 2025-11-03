<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TimeSlotStep from './TimeSlotStep.svelte';

  const { Story } = defineMeta({
    component: TimeSlotStep,
    title: 'Components/Steps/TimeSlotStep',
    tags: ['autodocs'],
    argTypes: {
      canEditRoutePlanning: { control: 'boolean' },
      showSearch: { control: 'boolean' },
    },
  });

  const availableTimeSlots = [
    {
      id: '1',
      documentId: 'doc1',
      start: '2024-12-05T18:00:00+01:00',
      end: '2024-12-05T19:00:00+01:00',
      label: 'Do 5.12. 18:00 - 19:00 Uhr',
      max_bookings: 4,
    },
    {
      id: '2',
      documentId: 'doc2',
      start: '2024-12-05T19:00:00+01:00',
      end: '2024-12-05T20:00:00+01:00',
      label: 'Do 5.12. 19:00 - 20:00 Uhr',
      max_bookings: 4,
    },
    {
      id: '3',
      documentId: 'doc3',
      start: '2024-12-05T20:00:00+01:00',
      end: '2024-12-05T21:00:00+01:00',
      label: 'Do 5.12. 20:00 - 21:00 Uhr',
      max_bookings: 4,
    },
    {
      id: '4',
      documentId: 'doc4',
      start: '2024-12-06T18:00:00+01:00',
      end: '2024-12-06T19:00:00+01:00',
      label: 'Fr 6.12. 18:00 - 19:00 Uhr',
      max_bookings: 4,
    },
    {
      id: '5',
      documentId: 'doc5',
      start: '2024-12-06T19:00:00+01:00',
      end: '2024-12-06T20:00:00+01:00',
      label: 'Fr 6.12. 19:00 - 20:00 Uhr',
      max_bookings: 4,
    },
  ];
</script>

<Story
  name="Default (Empty)"
  args={{
    availableTimeSlots,
    selectedTimeSlotIds: [],
    maxTimeSlots: 3,
    routePlanningDeadline: new Date('2024-12-01T19:30:00+01:00'),
    canEditRoutePlanning: true,
    showSearch: false,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="With Some Selected"
  args={{
    availableTimeSlots,
    selectedTimeSlotIds: ['1', '4'],
    maxTimeSlots: 3,
    routePlanningDeadline: new Date('2024-12-01T19:30:00+01:00'),
    canEditRoutePlanning: true,
    showSearch: false,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="Max Slots Selected"
  args={{
    availableTimeSlots,
    selectedTimeSlotIds: ['1', '3', '5'],
    maxTimeSlots: 3,
    routePlanningDeadline: new Date('2024-12-01T19:30:00+01:00'),
    canEditRoutePlanning: true,
    showSearch: false,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="With Search Enabled"
  args={{
    availableTimeSlots,
    selectedTimeSlotIds: [],
    maxTimeSlots: 3,
    routePlanningDeadline: new Date('2024-12-01T19:30:00+01:00'),
    canEditRoutePlanning: true,
    showSearch: true,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="Read-only (After Deadline)"
  args={{
    availableTimeSlots,
    selectedTimeSlotIds: ['1', '4', '5'],
    maxTimeSlots: 3,
    routePlanningDeadline: new Date('2024-12-01T19:30:00+01:00'),
    canEditRoutePlanning: false,
    showSearch: false,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="With Validation Error"
  args={{
    availableTimeSlots,
    selectedTimeSlotIds: ['1'],
    maxTimeSlots: 3,
    routePlanningDeadline: new Date('2024-12-01T19:30:00+01:00'),
    canEditRoutePlanning: true,
    showSearch: false,
    validationMessages: {
      'booking.time_slots': ['Bitte wähle mindestens 3 Zeitslots'],
    },
    onChange: () => {},
    onSubmit: () => {},
  }}
/>
