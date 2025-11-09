<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import ContactStep from './ContactStep.svelte';
  import type { Props } from './ContactStep.svelte';

  const { Story } = defineMeta({
    component: ContactStep,
    title: 'Components/Steps/ContactStep',
    tags: ['autodocs'],
    argTypes: {
      contactPerson: {
        control: 'object',
        description: 'Contact person information',
      },
      canEdit: {
        control: 'boolean',
        description: 'Whether the form can be edited',
      },
    },
    args: {
      contactPerson: {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      },
      finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
      canEdit: true,
      validationMessages: {},
      onChange: fn(),
      onSubmit: fn(),
    },
  });
</script>

{#snippet template(args: Props)}
  <div class="bg-java p-4">
    <ContactStep {...args} />
  </div>
{/snippet}

<Story name="Filled" {template} />

<Story
  name="Empty Form"
  args={{
    contactPerson: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
    },
  }}
  {template}
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
    validationMessages: {
      'booking.contact_person.first_name': ['Vorname ist erforderlich'],
    },
  }}
  {template}
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
    validationMessages: {
      'booking.contact_person.first_name': ['Vorname ist erforderlich'],
      'booking.contact_person.last_name': ['Nachname ist erforderlich'],
      'booking.contact_person.email': [
        'E-Mail-Adresse ist ungültig',
        'E-Mail-Adresse wird bereits verwendet',
      ],
      'booking.contact_person.phone_number': ['Telefonnummer ist erforderlich'],
    },
  }}
  {template}
/>

<Story
  name="Read-only (After Deadline)"
  args={{
    canEdit: false,
  }}
  {template}
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
  }}
  {template}
/>
