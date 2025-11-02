<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Input from './Input.svelte';

  const { Story } = defineMeta({
    component: Input,
    title: 'Components/Primitives/Input',
    tags: ['autodocs'],
  });
</script>

<Story name="Text Input">
  <Input label="First Name" id="first-name" placeholder="Enter your first name" />
</Story>

<Story name="Email Input">
  <Input label="Email Address" id="email" type="email" placeholder="example@example.com" />
</Story>

<Story name="Phone Input">
  <Input label="Phone Number" id="phone" type="tel" placeholder="0123 4567890" />
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

<Story name="All States">
  <div class="space-y-4">
    <Input label="Normal" id="normal" />
    <Input label="With Value" id="with-value" value="John Doe" />
    <Input label="With Error" id="with-error" error="This field is required" />
    <Input label="Readonly" id="readonly-state" value="Cannot edit" readonly />
    <Input label="Required" id="required-state" required />
  </div>
</Story>
