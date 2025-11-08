<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import ContactSummary from './ContactSummary.svelte';
  import type { Props } from './ContactSummary.svelte';

  const finalDeadline = new Date('2024-12-05T19:30:00+01:00');

  const completeContact: Props['contactPerson'] = {
    first_name: 'Max',
    last_name: 'Mustermann',
    email: 'max@example.com',
    phone_number: '+49 123 456789',
  };

  const incompleteContact: Props['contactPerson'] = {
    first_name: 'Max',
    last_name: '',
    email: 'max@example.com',
    phone_number: '',
  };

  const emptyContact: Props['contactPerson'] = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  };

  const partialContact: Props['contactPerson'] = {
    first_name: 'Emma',
    last_name: 'Schmidt',
    email: '',
    phone_number: '',
  };

  const { Story } = defineMeta({
    component: ContactSummary,
    title: 'Components/Summary/ContactSummary',
    tags: ['autodocs'],
    argTypes: {
      onEdit: { action: 'edit' },
      contactPerson: { control: 'object' },
      finalDeadline: { control: 'date' },
    },
    args: {
      contactPerson: completeContact,
      finalDeadline,
      onEdit: fn(),
    },
  });
</script>

<Story name="Playground" />

<Story name="All Fields Complete" />

<Story
  name="Some Fields Missing"
  args={{
    contactPerson: incompleteContact,
  }}
/>

<Story
  name="All Fields Empty"
  args={{
    contactPerson: emptyContact,
  }}
/>

<Story
  name="Only Name Provided"
  args={{
    contactPerson: partialContact,
  }}
/>
