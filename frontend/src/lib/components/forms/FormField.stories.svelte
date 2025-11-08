<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import FormField from './FormField.svelte';
  import type { Props } from './FormField.svelte';
  import Input from '../primitives/Input.svelte';
  import Textarea from '../primitives/Textarea.svelte';

  const { Story } = defineMeta({
    component: FormField,
    title: 'Components/Forms/FormField',
    tags: ['autodocs'],
    argTypes: {
      label: { control: 'text' },
      htmlFor: { control: 'text' },
      errors: { control: 'object' },
      testId: { control: 'text' },
    },
  });
</script>

<Story name="Playground" args={{ label: 'First Name *', htmlFor: 'playground-input', errors: [] }}>
  {#snippet template(args: Props)}
    <FormField {...args}>
      <Input
        id="playground-input"
        type="text"
        placeholder="Enter your input"
        data-testid="qa-playground"
      />
    </FormField>
  {/snippet}
</Story>

<Story name="Default" args={{ label: 'First Name *', htmlFor: 'first-name' }}>
  {#snippet template(args: Props)}
    <FormField {...args}>
      <Input
        id="first-name"
        type="text"
        placeholder="Enter your first name"
        data-testid="qa-first-name"
      />
    </FormField>
  {/snippet}
</Story>

<Story name="With TestId" args={{ label: 'Email *', htmlFor: 'email', testId: 'qa-email-field' }}>
  {#snippet template(args: Props)}
    <FormField {...args}>
      <Input id="email" type="email" placeholder="Enter your email" data-testid="qa-email" />
    </FormField>
  {/snippet}
</Story>

<Story
  name="With Single Error"
  args={{ label: 'Email *', htmlFor: 'email', errors: ['Email is required'] }}
>
  {#snippet template(args: Props)}
    <FormField {...args}>
      <Input id="email" type="email" placeholder="Enter your email" data-testid="qa-email" />
    </FormField>
  {/snippet}
</Story>

<Story
  name="With Multiple Errors"
  args={{
    label: 'Password *',
    htmlFor: 'password',
    errors: ['Password is required', 'Password must be at least 8 characters'],
  }}
>
  {#snippet template(args: Props)}
    <FormField {...args}>
      <Input
        id="password"
        type="password"
        placeholder="Enter your password"
        data-testid="qa-password"
      />
    </FormField>
  {/snippet}
</Story>

<Story
  name="With Many Errors"
  args={{
    label: 'Username *',
    htmlFor: 'username',
    errors: [
      'Username is required',
      'Username must be at least 3 characters',
      'Username can only contain letters, numbers, and underscores',
      'Username cannot start with a number',
      'Username is already taken',
    ],
  }}
>
  {#snippet template(args: Props)}
    <FormField {...args}>
      <Input id="username" type="text" placeholder="Enter username" data-testid="qa-username" />
    </FormField>
  {/snippet}
</Story>

<Story
  name="With Long Error Message"
  args={{
    label: 'API Key *',
    htmlFor: 'api-key',
    errors: [
      'The API key format is invalid. It must be a 64-character hexadecimal string starting with "sk_" followed by 61 alphanumeric characters. Please check the documentation for the correct format.',
    ],
  }}
>
  {#snippet template(args: Props)}
    <FormField {...args}>
      <Input id="api-key" type="text" placeholder="Enter API key" data-testid="qa-api-key" />
    </FormField>
  {/snippet}
</Story>

<Story name="With Textarea" args={{ label: 'Additional Notes', htmlFor: 'notes' }}>
  {#snippet template(args: Props)}
    <FormField {...args}>
      <Textarea
        id="notes"
        placeholder="Enter any additional information..."
        rows={4}
        data-testid="qa-notes"
      />
    </FormField>
  {/snippet}
</Story>

<Story name="Without Children" args={{ label: 'Empty Field', htmlFor: 'empty-field' }} />

<Story
  name="Without Children With Errors"
  args={{
    label: 'Missing Input',
    htmlFor: 'missing',
    errors: ['This field is required', 'Input element is missing'],
  }}
/>

<Story
  name="Long Label"
  args={{
    label:
      'Please provide your complete residential address including street name, house number, postal code, city, and country for shipping purposes *',
    htmlFor: 'long-label',
  }}
>
  {#snippet template(args: Props)}
    <FormField {...args}>
      <Input id="long-label" type="text" placeholder="Enter address" data-testid="qa-long-label" />
    </FormField>
  {/snippet}
</Story>

<Story name="Multiple Fields Form">
  {#snippet template()}
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

      <FormField label="Comments" htmlFor="comments">
        <Textarea
          id="comments"
          placeholder="Optional comments..."
          rows={3}
          data-testid="qa-comments"
        />
      </FormField>
    </div>
  {/snippet}
</Story>
