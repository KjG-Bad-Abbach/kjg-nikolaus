<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Checkbox from './Checkbox.svelte';
  import type { Props } from './Checkbox.svelte';

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

<Story
  name="Default"
  args={{
    label: 'Accept Terms and Conditions',
    id: 'terms',
  }}
/>

<Story
  name="Checked"
  args={{
    label: 'Subscribe to Newsletter',
    id: 'newsletter',
    checked: true,
  }}
/>

<Story
  name="Disabled"
  args={{
    label: 'Disabled Option',
    id: 'disabled',
    disabled: true,
  }}
/>

<Story
  name="Disabled Checked"
  args={{
    label: 'Disabled and Checked',
    id: 'disabled-checked',
    checked: true,
    disabled: true,
  }}
/>

<Story
  name="With Value"
  args={{
    label: 'Time Slot Selection',
    id: 'timeslot-1',
    value: 'slot-1',
  }}
/>

<Story
  name="Without Label"
  args={{
    id: 'no-label',
  }}
/>

<Story
  name="Required"
  args={{
    label: 'I agree to the terms *',
    id: 'terms-required',
    required: true,
  }}
/>

<Story
  name="Long Label"
  args={{
    label:
      'I agree to the very long terms and conditions that might wrap to multiple lines and need to be displayed properly with good alignment',
    id: 'long-label',
  }}
/>

<Story
  name="Custom Classes"
  args={{
    label: 'Custom Styled',
    id: 'custom',
    class: 'ring-2 ring-rust',
  }}
/>

<Story name="Multiple Checkboxes">
  {#snippet template(args: Props)}
    <div class="space-y-2">
      <Checkbox {...args} label="Option 1" id="option-1" />
      <Checkbox {...args} label="Option 2" id="option-2" checked />
      <Checkbox {...args} label="Option 3" id="option-3" />
      <Checkbox {...args} label="Option 4 (Disabled)" id="option-4" disabled />
    </div>
  {/snippet}
</Story>

<Story name="All States Comparison">
  {#snippet template(args: Props)}
    <div class="space-y-3">
      <div class="space-y-2">
        <p class="text-sm font-bold">Enabled States:</p>
        <Checkbox {...args} label="Unchecked" id="state-1" />
        <Checkbox {...args} label="Checked" id="state-2" checked />
      </div>
      <div class="space-y-2">
        <p class="text-sm font-bold">Disabled States:</p>
        <Checkbox {...args} label="Disabled Unchecked" id="state-3" disabled />
        <Checkbox {...args} label="Disabled Checked" id="state-4" checked disabled />
      </div>
    </div>
  {/snippet}
</Story>
