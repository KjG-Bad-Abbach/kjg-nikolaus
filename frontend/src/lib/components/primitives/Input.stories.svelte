<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Input from './Input.svelte';

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

<Story name="Text Input">
  <Input label="First Name" id="first-name" placeholder="Enter your first name" />
</Story>

<Story name="Email Input">
  <Input label="Email Address" id="email" type="email" placeholder="example@example.com" />
</Story>

<Story name="Phone Input">
  <Input label="Phone Number" id="phone" type="tel" placeholder="0123 4567890" />
</Story>

<Story name="Password Input">
  <Input label="Password" id="password" type="password" placeholder="Enter your password" />
</Story>

<Story name="Number Input">
  <Input label="Age" id="age" type="number" placeholder="Enter your age" />
</Story>

<Story name="URL Input">
  <Input label="Website" id="website" type="url" placeholder="https://example.com" />
</Story>

<Story name="Date Input">
  <Input label="Birth Date" id="birthdate" type="date" />
</Story>

<Story name="Search Input">
  <Input label="Search" id="search" type="search" placeholder="Search..." />
</Story>

<Story name="Without Label">
  <Input id="no-label" placeholder="Input without label" />
</Story>

<Story name="With Error">
  <Input label="First Name" id="name-error" error="This field is required" />
</Story>

<Story name="Readonly">
  <Input label="First Name" id="name-readonly" value="John Doe" readonly />
</Story>

<Story name="Required">
  <Input label="First Name" id="name-required" required placeholder="Required field" />
</Story>

<Story name="With Max Length">
  <Input label="First Name" id="name-maxlength" maxlength={50} placeholder="Max 50 characters" />
</Story>

<Story name="Long Value">
  <div class="max-w-xs">
    <Input
      label="Long Text"
      id="long-value"
      value="This is a very long value that might overflow the input field and needs to be scrollable"
    />
  </div>
</Story>

<Story name="Disabled">
  <Input label="Disabled Field" id="disabled-input" value="Cannot edit" disabled />
</Story>

<Story name="Custom Classes">
  <Input
    label="Custom Styled"
    id="custom"
    class="ring-2 ring-atlantis"
    placeholder="Custom style"
  />
</Story>

<Story name="With Autofocus">
  <Input label="Auto-focused Field" id="autofocus" autofocus placeholder="This field is focused" />
</Story>

<Story name="All States Comparison">
  <div class="space-y-4">
    <Input label="Normal" id="normal" placeholder="Normal input" />
    <Input label="With Value" id="with-value" value="John Doe" />
    <Input label="With Placeholder" id="with-placeholder" placeholder="Enter text here" />
    <Input label="With Error" id="with-error" value="invalid@" error="Invalid email format" />
    <Input label="Readonly" id="readonly-state" value="Cannot edit" readonly />
    <Input label="Disabled" id="disabled-state" value="Cannot edit" disabled />
    <Input label="Required *" id="required-state" required />
    <Input label="Max Length (10)" id="maxlength-state" maxlength={10} value="12345" />
  </div>
</Story>
