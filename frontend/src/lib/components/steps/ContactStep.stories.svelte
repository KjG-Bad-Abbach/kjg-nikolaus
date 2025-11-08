<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ContactStep from './ContactStep.svelte';

  const { Story } = defineMeta({
    component: ContactStep,
    title: 'Components/Steps/ContactStep',
    tags: ['autodocs'],
    argTypes: {
      'contactPerson.first_name': {
        control: 'text',
        description: 'First name of the contact person',
      },
      'contactPerson.last_name': {
        control: 'text',
        description: 'Last name of the contact person',
      },
      'contactPerson.email': {
        control: 'text',
        description: 'Email address',
      },
      'contactPerson.phone_number': {
        control: 'text',
        description: 'Phone number',
      },
      canEdit: {
        control: 'boolean',
        description: 'Whether the form can be edited',
      },
    },
  });
</script>

<Story
  name="Playground"
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
  name="Empty Form"
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
  name="With Single Validation Error"
  args={{
    contactPerson: {
      first_name: '',
      last_name: 'Mustermann',
      email: 'max@example.com',
      phone_number: '+49 123 456789',
    },
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEdit: true,
    validationMessages: {
      'booking.contact_person.first_name': ['Vorname ist erforderlich'],
    },
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="With Multiple Validation Errors"
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
  name="With Very Long Values"
  args={{
    contactPerson: {
      first_name: 'Maximilian-Alexander-Ferdinand',
      last_name: 'Mustermann-Beispielmann-Testperson',
      email: 'very.long.email.address.with.multiple.parts@example-domain-name.com',
      phone_number: '+49 (0) 123 / 456789-0',
    },
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEdit: true,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>
