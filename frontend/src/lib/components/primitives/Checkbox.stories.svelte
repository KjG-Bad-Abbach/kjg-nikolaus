<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Checkbox from './Checkbox.svelte';

  const { Story } = defineMeta({
    component: Checkbox,
    title: 'Components/Primitives/Checkbox',
    tags: ['autodocs'],
    argTypes: {
      label: { control: 'text' },
      id: { control: 'text' },
      checked: { control: 'boolean' },
      disabled: { control: 'boolean' },
      required: { control: 'boolean' },
      value: { control: 'text' },
    },
  });
</script>

<Story
  name="Playground"
  args={{
    label: 'Accept Terms and Conditions',
    id: 'playground-checkbox',
    checked: false,
    disabled: false,
    required: false,
    value: '',
  }}
/>

<Story name="Default">
  <Checkbox label="Accept Terms and Conditions" id="terms" />
</Story>

<Story name="Checked">
  <Checkbox label="Subscribe to Newsletter" id="newsletter" checked />
</Story>

<Story name="Disabled">
  <Checkbox label="Disabled Option" id="disabled" disabled />
</Story>

<Story name="Disabled Checked">
  <Checkbox label="Disabled and Checked" id="disabled-checked" checked disabled />
</Story>

<Story name="With Value">
  <Checkbox label="Time Slot Selection" id="timeslot-1" value="slot-1" />
</Story>

<Story name="Without Label">
  <Checkbox id="no-label" />
</Story>

<Story name="Required">
  <Checkbox label="I agree to the terms *" id="terms-required" required />
</Story>

<Story name="Long Label">
  <Checkbox
    label="I agree to the very long terms and conditions that might wrap to multiple lines and need to be displayed properly with good alignment"
    id="long-label"
  />
</Story>

<Story name="Custom Classes">
  <Checkbox label="Custom Styled" id="custom" class="ring-2 ring-rust" />
</Story>

<Story name="Multiple Checkboxes">
  <div class="space-y-2">
    <Checkbox label="Option 1" id="option-1" />
    <Checkbox label="Option 2" id="option-2" checked />
    <Checkbox label="Option 3" id="option-3" />
    <Checkbox label="Option 4 (Disabled)" id="option-4" disabled />
  </div>
</Story>

<Story name="All States Comparison">
  <div class="space-y-3">
    <div class="space-y-2">
      <p class="text-sm font-bold">Enabled States:</p>
      <Checkbox label="Unchecked" id="state-1" />
      <Checkbox label="Checked" id="state-2" checked />
    </div>
    <div class="space-y-2">
      <p class="text-sm font-bold">Disabled States:</p>
      <Checkbox label="Disabled Unchecked" id="state-3" disabled />
      <Checkbox label="Disabled Checked" id="state-4" checked disabled />
    </div>
  </div>
</Story>
