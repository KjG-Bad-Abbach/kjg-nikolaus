<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import AddressSummary from './AddressSummary.svelte';

  const { Story } = defineMeta({
    component: AddressSummary,
    title: 'Components/Summary/AddressSummary',
    tags: ['autodocs'],
    argTypes: {
      onEdit: { action: 'edit' },
    },
  });

  const routePlanningDeadline = new Date('2024-12-05T19:30:00+01:00');
  const finalDeadline = new Date('2024-12-10T19:30:00+01:00');

  const completeLocation = {
    street: 'Musterstraße',
    house_number: '42',
    zip_code: '12345',
    place: 'Musterstadt',
  };

  const incompleteLocation = {
    street: 'Musterstraße',
    house_number: '',
    zip_code: '12345',
    place: '',
  };

  const emptyLocation = {
    street: '',
    house_number: '',
    zip_code: '',
    place: '',
  };
</script>

<Story
  name="Complete"
  args={{
    location: completeLocation,
    presentLocation: 'Unter dem Weihnachtsbaum',
    routePlanningDeadline,
    finalDeadline,
  }}
/>

<Story
  name="Incomplete"
  args={{
    location: incompleteLocation,
    presentLocation: 'Unter dem Weihnachtsbaum',
    routePlanningDeadline,
    finalDeadline,
  }}
/>

<Story
  name="Empty"
  args={{
    location: emptyLocation,
    presentLocation: '',
    routePlanningDeadline,
    finalDeadline,
  }}
/>

<Story
  name="Missing Present Location"
  args={{
    location: completeLocation,
    presentLocation: '',
    routePlanningDeadline,
    finalDeadline,
  }}
/>
