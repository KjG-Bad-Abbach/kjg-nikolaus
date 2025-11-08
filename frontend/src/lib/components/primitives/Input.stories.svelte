<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Input from './Input.svelte';
  import type { Props } from './Input.svelte';

  const { Story } = defineMeta({
    component: Input,
    title: 'Components/Primitives/Input',
    tags: ['autodocs'],
    argTypes: {
      label: { control: 'text' },
      id: { control: 'text' },
      type: {
        control: 'select',
        options: ['text', 'email', 'tel', 'password', 'number', 'url', 'date', 'search'],
      },
      placeholder: { control: 'text' },
      value: { control: 'text' },
      error: { control: 'text' },
      readonly: { control: 'boolean' },
      disabled: { control: 'boolean' },
      required: { control: 'boolean' },
      maxlength: { control: 'number' },
    },
  });
</script>

<Story
  name="Playground"
  args={{
    label: 'First Name',
    id: 'playground-input',
    type: 'text',
    placeholder: 'Enter your first name',
    value: '',
    error: '',
    readonly: false,
    disabled: false,
    required: false,
  }}
/>

<Story
  name="Text Input"
  args={{
    label: 'First Name',
    id: 'first-name',
    placeholder: 'Enter your first name',
  }}
/>

<Story
  name="Email Input"
  args={{
    label: 'Email Address',
    id: 'email',
    type: 'email',
    placeholder: 'example@example.com',
  }}
/>

<Story
  name="Phone Input"
  args={{
    label: 'Phone Number',
    id: 'phone',
    type: 'tel',
    placeholder: '0123 4567890',
  }}
/>

<Story
  name="Password Input"
  args={{
    label: 'Password',
    id: 'password',
    type: 'password',
    placeholder: 'Enter your password',
  }}
/>

<Story
  name="Number Input"
  args={{
    label: 'Age',
    id: 'age',
    type: 'number',
    placeholder: 'Enter your age',
  }}
/>

<Story
  name="URL Input"
  args={{
    label: 'Website',
    id: 'website',
    type: 'url',
    placeholder: 'https://example.com',
  }}
/>

<Story
  name="Date Input"
  args={{
    label: 'Birth Date',
    id: 'birthdate',
    type: 'date',
  }}
/>

<Story
  name="Search Input"
  args={{
    label: 'Search',
    id: 'search',
    type: 'search',
    placeholder: 'Search...',
  }}
/>

<Story
  name="Without Label"
  args={{
    id: 'no-label',
    placeholder: 'Input without label',
  }}
/>

<Story
  name="With Error"
  args={{
    label: 'First Name',
    id: 'name-error',
    error: 'This field is required',
  }}
/>

<Story
  name="Readonly"
  args={{
    label: 'First Name',
    id: 'name-readonly',
    value: 'John Doe',
    readonly: true,
  }}
/>

<Story
  name="Required"
  args={{
    label: 'First Name',
    id: 'name-required',
    required: true,
    placeholder: 'Required field',
  }}
/>

<Story
  name="With Max Length"
  args={{
    label: 'First Name',
    id: 'name-maxlength',
    maxlength: 50,
    placeholder: 'Max 50 characters',
  }}
/>

<Story name="Long Value">
  {#snippet template(args: Props)}
    <div class="max-w-xs">
      <Input
        {...args}
        label="Long Text"
        id="long-value"
        value="This is a very long value that might overflow the input field and needs to be scrollable"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Disabled"
  args={{
    label: 'Disabled Field',
    id: 'disabled-input',
    value: 'Cannot edit',
    disabled: true,
  }}
/>

<Story
  name="Custom Classes"
  args={{
    label: 'Custom Styled',
    id: 'custom',
    class: 'ring-2 ring-atlantis',
    placeholder: 'Custom style',
  }}
/>

<Story
  name="With Autofocus"
  args={{
    label: 'Auto-focused Field',
    id: 'autofocus',
    autofocus: true,
    placeholder: 'This field is focused',
  }}
/>

<Story name="All States Comparison">
  {#snippet template(args: Props)}
    <div class="space-y-4">
      <Input {...args} label="Normal" id="normal" placeholder="Normal input" />
      <Input {...args} label="With Value" id="with-value" value="John Doe" />
      <Input
        {...args}
        label="With Placeholder"
        id="with-placeholder"
        placeholder="Enter text here"
      />
      <Input
        {...args}
        label="With Error"
        id="with-error"
        value="invalid@"
        error="Invalid email format"
      />
      <Input {...args} label="Readonly" id="readonly-state" value="Cannot edit" readonly />
      <Input {...args} label="Disabled" id="disabled-state" value="Cannot edit" disabled />
      <Input {...args} label="Required *" id="required-state" required />
      <Input {...args} label="Max Length (10)" id="maxlength-state" maxlength={10} value="12345" />
    </div>
  {/snippet}
</Story>
