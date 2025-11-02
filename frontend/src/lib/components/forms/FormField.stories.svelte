<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import FormField from './FormField.svelte';
  import Input from '../primitives/Input.svelte';
  import Textarea from '../primitives/Textarea.svelte';

  const { Story } = defineMeta({
    component: FormField,
    title: 'Components/Forms/FormField',
    tags: ['autodocs'],
  });
</script>

<Story name="Default with Input">
  <FormField label="First Name *" htmlFor="first-name">
    <Input
      id="first-name"
      type="text"
      placeholder="Enter your first name"
      data-testid="qa-first-name"
    />
  </FormField>
</Story>

<Story name="With Single Error">
  <FormField label="Email *" htmlFor="email" errors={['Email is required']}>
    <Input id="email" type="email" placeholder="Enter your email" data-testid="qa-email" />
  </FormField>
</Story>

<Story name="With Multiple Errors">
  <FormField
    label="Password *"
    htmlFor="password"
    errors={['Password is required', 'Password must be at least 8 characters']}
  >
    <Input
      id="password"
      type="password"
      placeholder="Enter your password"
      data-testid="qa-password"
    />
  </FormField>
</Story>

<Story name="With Textarea">
  <FormField label="Additional Notes" htmlFor="notes">
    <Textarea
      id="notes"
      placeholder="Enter any additional information..."
      rows={4}
      data-testid="qa-notes"
    />
  </FormField>
</Story>

<Story name="Multiple Fields">
  <div class="space-y-6">
    <FormField label="First Name *" htmlFor="first-name">
      <Input id="first-name" type="text" placeholder="First name" data-testid="qa-first-name" />
    </FormField>

    <FormField label="Last Name *" htmlFor="last-name">
      <Input id="last-name" type="text" placeholder="Last name" data-testid="qa-last-name" />
    </FormField>

    <FormField label="Email *" htmlFor="email" errors={['Please enter a valid email address']}>
      <Input id="email" type="email" placeholder="Email" data-testid="qa-email" />
    </FormField>
  </div>
</Story>

<Story name="Required Field">
  <FormField label="Phone Number *" htmlFor="phone">
    <Input id="phone" type="tel" placeholder="+49 123 456789" required data-testid="qa-phone" />
  </FormField>
</Story>
