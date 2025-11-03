<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ContactStep from './ContactStep.svelte';

  const { Story } = defineMeta({
    component: ContactStep,
    title: 'Components/Steps/ContactStep',
    tags: ['autodocs'],
    argTypes: {
      canEdit: { control: 'boolean' },
    },
  });
</script>

<Story
  name="Default (Empty)"
  args={{
    contactPerson: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
    },
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEdit: true,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="Filled"
  args={{
    contactPerson: {
      first_name: 'Max',
      last_name: 'Mustermann',
      email: 'max@example.com',
      phone_number: '+49 123 456789',
    },
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEdit: true,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="With Validation Errors"
  args={{
    contactPerson: {
      first_name: '',
      last_name: '',
      email: 'invalid-email',
      phone_number: '',
    },
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEdit: true,
    validationMessages: {
      'booking.contact_person.first_name': ['Vorname ist erforderlich'],
      'booking.contact_person.last_name': ['Nachname ist erforderlich'],
      'booking.contact_person.email': [
        'E-Mail-Adresse ist ungültig',
        'E-Mail-Adresse wird bereits verwendet',
      ],
      'booking.contact_person.phone_number': ['Telefonnummer ist erforderlich'],
    },
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="Read-only (After Deadline)"
  args={{
    contactPerson: {
      first_name: 'Max',
      last_name: 'Mustermann',
      email: 'max@example.com',
      phone_number: '+49 123 456789',
    },
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEdit: false,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="Partially Filled"
  args={{
    contactPerson: {
      first_name: 'Max',
      last_name: '',
      email: 'max@example.com',
      phone_number: '',
    },
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEdit: true,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>
