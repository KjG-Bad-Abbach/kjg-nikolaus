<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import TimeSlotStep from './TimeSlotStep.svelte';
  import type { Props } from './TimeSlotStep.svelte';

  const availableTimeSlots: Props['availableTimeSlots'] = [
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

  // Generate many time slots for testing scrolling behavior
  const manyTimeSlots: Props['availableTimeSlots'] = [];
  const dates = ['05', '06', '07'];
  const dayNames = ['Do', 'Fr', 'Sa'];
  let idCounter = 1;

  dates.forEach((date, dateIndex) => {
    for (let hour = 16; hour <= 20; hour++) {
      manyTimeSlots.push({
        id: String(idCounter),
        documentId: `doc${idCounter}`,
        start: `2024-12-${date}T${String(hour).padStart(2, '0')}:00:00+01:00`,
        end: `2024-12-${date}T${String(hour + 1).padStart(2, '0')}:00:00+01:00`,
        label: `${dayNames[dateIndex]} ${date}.12. ${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00 Uhr`,
        max_bookings: 4,
      });
      idCounter++;
    }
  });

  const { Story } = defineMeta({
    component: TimeSlotStep,
    title: 'Components/Steps/TimeSlotStep',
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
    },
    argTypes: {
      maxTimeSlots: {
        control: { type: 'number', min: 1, max: 10 },
        description: 'Maximum number of time slots that can be selected',
      },
      canEditRoutePlanning: {
        control: 'boolean',
        description: 'Whether time slots can be edited',
      },
      showSearch: {
        control: 'boolean',
        description: 'Whether to show the search input',
      },
    },
    args: {
      availableTimeSlots,
      selectedTimeSlotIds: [],
      maxTimeSlots: 3,
      routePlanningDeadline: new Date('2024-12-01T19:30:00+01:00'),
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: fn(),
      onSubmit: fn(),
    },
  });
</script>

{#snippet template(args: Props)}
  <div class="bg-java p-4">
    <TimeSlotStep {...args} />
  </div>
{/snippet}

<Story
  name="Some Selected"
  args={{
    selectedTimeSlotIds: ['1', '4'],
    showSearch: true,
  }}
  {template}
/>

<Story name="Empty (No Selection)" />

<Story
  name="Max Slots Selected"
  args={{
    selectedTimeSlotIds: ['1', '3', '5'],
  }}
  {template}
/>

<Story
  name="With Search Enabled"
  args={{
    showSearch: true,
  }}
  {template}
/>

<Story
  name="Read-only (After Deadline)"
  args={{
    selectedTimeSlotIds: ['1', '4', '5'],
    canEditRoutePlanning: false,
  }}
  {template}
/>

<Story
  name="With Validation Error"
  args={{
    selectedTimeSlotIds: ['1'],
    validationMessages: {
      'booking.time_slots': ['Bitte wähle mindestens 3 Zeitslots'],
    },
  }}
  {template}
/>

<Story
  name="No Available Slots"
  args={{
    availableTimeSlots: [],
  }}
  {template}
/>

<Story
  name="Many Time Slots (15)"
  args={{
    availableTimeSlots: manyTimeSlots,
    selectedTimeSlotIds: ['1', '8', '12'],
    showSearch: true,
  }}
  {template}
/>

<Story
  name="Only One Slot Available"
  args={{
    availableTimeSlots: [availableTimeSlots[0]],
  }}
  {template}
/>
