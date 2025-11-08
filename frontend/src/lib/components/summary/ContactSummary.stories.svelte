<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ContactSummary from './ContactSummary.svelte';

  const { Story } = defineMeta({
    component: ContactSummary,
    title: 'Components/Summary/ContactSummary',
    tags: ['autodocs'],
    argTypes: {
      onEdit: { action: 'edit' },
      contactPerson: { control: 'object' },
      finalDeadline: { control: 'date' },
    },
  });

  const finalDeadline = new Date('2024-12-05T19:30:00+01:00');

  const completeContact = {
    first_name: 'Max',
    last_name: 'Mustermann',
    email: 'max@example.com',
    phone_number: '+49 123 456789',
  };

  const incompleteContact = {
    first_name: 'Max',
    last_name: '',
    email: 'max@example.com',
    phone_number: '',
  };

  const emptyContact = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  };

  const partialContact = {
    first_name: 'Emma',
    last_name: 'Schmidt',
    email: '',
    phone_number: '',
  };
</script>

<Story
  name="Playground"
  args={{
    contactPerson: completeContact,
    finalDeadline,
  }}
/>

<Story
  name="All Fields Complete"
  args={{
    contactPerson: completeContact,
    finalDeadline,
  }}
/>

<Story
  name="Some Fields Missing"
  args={{
    contactPerson: incompleteContact,
    finalDeadline,
  }}
/>

<Story
  name="All Fields Empty"
  args={{
    contactPerson: emptyContact,
    finalDeadline,
  }}
/>

<Story
  name="Only Name Provided"
  args={{
    contactPerson: partialContact,
    finalDeadline,
  }}
/>
