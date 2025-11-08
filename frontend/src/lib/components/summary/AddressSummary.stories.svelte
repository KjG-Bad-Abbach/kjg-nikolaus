<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import AddressSummary from './AddressSummary.svelte';
  import type { Props } from './AddressSummary.svelte';

  const routePlanningDeadline = new Date('2024-12-05T19:30:00+01:00');
  const finalDeadline = new Date('2024-12-10T19:30:00+01:00');

  const completeLocation: Props['location'] = {
    street: 'Musterstraße',
    house_number: '42',
    zip_code: '12345',
    place: 'Musterstadt',
  };

  const incompleteLocation: Props['location'] = {
    street: 'Musterstraße',
    house_number: '',
    zip_code: '12345',
    place: '',
  };

  const emptyLocation: Props['location'] = {
    street: '',
    house_number: '',
    zip_code: '',
    place: '',
  };

  const { Story } = defineMeta({
    component: AddressSummary,
    title: 'Components/Summary/AddressSummary',
    tags: ['autodocs'],
    argTypes: {
      onEdit: { action: 'edit' },
      location: { control: 'object' },
      presentLocation: { control: 'text' },
      routePlanningDeadline: { control: 'date' },
      finalDeadline: { control: 'date' },
    },
    args: {
      location: completeLocation,
      presentLocation: 'Unter dem Weihnachtsbaum',
      routePlanningDeadline,
      finalDeadline,
      onEdit: fn(),
    },
  });
</script>

<Story name="Playground" />

<Story name="All Fields Complete" />

<Story
  name="Address Incomplete"
  args={{
    location: incompleteLocation,
  }}
/>

<Story
  name="All Fields Empty"
  args={{
    location: emptyLocation,
    presentLocation: '',
  }}
/>

<Story
  name="Address Complete, Present Location Missing"
  args={{
    presentLocation: '',
  }}
/>

<Story
  name="With Long Present Location Text"
  args={{
    presentLocation:
      'Unter dem Weihnachtsbaum im Wohnzimmer, direkt neben der großen Standuhr. Bitte klingeln Sie zweimal.',
  }}
/>
