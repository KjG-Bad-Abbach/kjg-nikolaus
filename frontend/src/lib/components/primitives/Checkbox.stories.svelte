<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Checkbox from './Checkbox.svelte';

  const { Story } = defineMeta({
    component: Checkbox,
    title: 'Components/Primitives/Checkbox',
    tags: ['autodocs'],
  });
</script>

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

<Story name="Multiple Checkboxes">
  <div class="space-y-2">
    <Checkbox label="Option 1" id="option-1" />
    <Checkbox label="Option 2" id="option-2" checked />
    <Checkbox label="Option 3" id="option-3" />
    <Checkbox label="Option 4 (Disabled)" id="option-4" disabled />
  </div>
</Story>
