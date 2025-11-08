<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import AddressStep from './AddressStep.svelte';

  const { Story } = defineMeta({
    component: AddressStep,
    title: 'Components/Steps/AddressStep',
    tags: ['autodocs'],
    argTypes: {
      location: {
        control: 'object',
        description: 'Address location information',
      },
      presentLocation: {
        control: 'text',
        description: 'Where to find the presents',
      },
      canEditRoutePlanning: {
        control: 'boolean',
        description: 'Whether route planning fields can be edited',
      },
      canEditAnything: {
        control: 'boolean',
        description: 'Whether any field can be edited',
      },
    },
    args: {
      location: {
        street: 'Musterstraße',
        house_number: '42',
        zip_code: '12345',
        place: 'Musterstadt',
      },
      presentLocation: 'In der Garage hinter der Papiertonne',
      routePlanningDeadline: new Date('2024-12-01T19:30:00+01:00'),
      finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange: fn(),
      onSubmit: fn(),
    },
  });
</script>

<Story name="Playground" />

<Story
  name="Empty Form"
  args={{
    location: {
      street: '',
      house_number: '',
      zip_code: '',
      place: '',
    },
    presentLocation: '',
  }}
/>

<Story name="Filled" />

<Story
  name="With Validation Errors"
  args={{
    location: {
      street: '',
      house_number: '',
      zip_code: '999',
      place: '',
    },
    presentLocation: '',
    validationMessages: {
      'booking.location.street': ['Straße ist erforderlich'],
      'booking.location.house_number': ['Hausnummer ist erforderlich'],
      'booking.location.zip_code': ['PLZ muss 5 Ziffern haben'],
      'booking.location.place': ['Ort ist erforderlich'],
    },
  }}
/>

<Story
  name="Read-only Address (After Route Planning Deadline)"
  args={{
    presentLocation: 'In der Garage',
    canEditRoutePlanning: false,
  }}
/>

<Story
  name="Fully Read-only (After Final Deadline)"
  args={{
    canEditRoutePlanning: false,
    canEditAnything: false,
  }}
/>

<Story
  name="Address Without Present Location"
  args={{
    location: {
      street: 'Hauptstraße',
      house_number: '10',
      zip_code: '80331',
      place: 'München',
    },
    presentLocation: '',
  }}
/>

<Story
  name="With Very Long Address"
  args={{
    location: {
      street: 'Donaudampfschifffahrtsgesellschaftskapitänsstraße',
      house_number: '123/456a',
      zip_code: '99999',
      place: 'Garching bei München am Oberbayerischen Alpenrand',
    },
    presentLocation:
      'Im Gartenhäuschen hinter dem Haus auf der rechten Seite, der Schlüssel liegt unter dem großen grauen Blumentopf neben der blauen Tür mit dem Weihnachtskranz',
  }}
/>
