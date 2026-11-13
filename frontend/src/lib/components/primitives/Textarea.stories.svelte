<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Textarea from './Textarea.svelte';
  import type { Props } from './Textarea.svelte';

  const { Story } = defineMeta({
    component: Textarea,
    title: 'Components/Primitives/Textarea',
    tags: ['autodocs'],
    argTypes: {
      label: { control: 'text' },
      id: { control: 'text' },
      placeholder: { control: 'text' },
      value: { control: 'text' },
      error: { control: 'text' },
      rows: { control: 'number' },
      readonly: { control: 'boolean' },
      disabled: { control: 'boolean' },
    },
  });
</script>

<Story
  name="Playground"
  args={{
    label: 'Additional Notes',
    id: 'playground-textarea',
    placeholder: 'Enter additional notes',
    value: '',
    error: '',
    rows: 4,
    readonly: false,
    disabled: false,
  }}
/>

<Story
  name="Default"
  args={{
    label: 'Additional Notes',
    id: 'notes',
    placeholder: 'Enter additional notes',
  }}
/>

<Story
  name="Without Label"
  args={{
    id: 'no-label',
    placeholder: 'Textarea without label',
  }}
/>

<Story
  name="Few Rows (2)"
  args={{
    label: 'Short Message',
    id: 'short',
    rows: 2,
    placeholder: 'Brief message',
  }}
/>

<Story
  name="Standard Rows (4)"
  args={{
    label: 'Standard Message',
    id: 'standard',
    rows: 4,
    placeholder: 'Standard message area',
  }}
/>

<Story
  name="Many Rows (8)"
  args={{
    label: 'Speech',
    id: 'speech',
    rows: 8,
    placeholder: 'Rede für den Nikolaus',
  }}
/>

<Story
  name="Very Many Rows (15)"
  args={{
    label: 'Long Essay',
    id: 'essay',
    rows: 15,
    placeholder: 'Write your essay here',
  }}
/>

<Story
  name="With Error"
  args={{
    label: 'Description',
    id: 'description-error',
    error: 'This field is required',
  }}
/>

<Story
  name="Readonly"
  args={{
    label: 'Description',
    id: 'description-readonly',
    value: 'This is readonly content',
    readonly: true,
  }}
/>

<Story
  name="With Value"
  args={{
    label: 'Notes',
    id: 'notes-value',
    value: 'Some existing notes here',
    rows: 4,
  }}
/>

<Story name="Long Value">
  {#snippet template(args: Props)}
    <div class="max-w-md">
      <Textarea
        {...args}
        label="Long Text"
        id="long-value"
        rows={6}
        value="This is a very long text that spans multiple lines and demonstrates how the textarea handles lengthy content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Disabled"
  args={{
    label: 'Disabled Field',
    id: 'disabled-textarea',
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
  name="Required"
  args={{
    label: 'Required Field *',
    id: 'required-textarea',
    required: true,
    placeholder: 'This field is required',
  }}
/>

<Story
  name="With Placeholder"
  args={{
    label: 'Comments',
    id: 'with-placeholder',
    placeholder: 'Please enter your comments here...',
  }}
/>

<Story name="All States Comparison">
  {#snippet template(args: Props)}
    <div class="space-y-4">
      <Textarea {...args} label="Normal" id="normal" placeholder="Normal textarea" />
      <Textarea {...args} label="With Value" id="with-value" value="Some content" rows={3} />
      <Textarea
        {...args}
        label="With Error"
        id="with-error"
        value="Invalid"
        error="Content is too short"
      />
      <Textarea
        {...args}
        label="Readonly"
        id="readonly-state"
        value="Cannot edit this text"
        readonly
      />
      <Textarea
        {...args}
        label="Disabled"
        id="disabled-state"
        value="Cannot edit this text"
        disabled
      />
      <Textarea {...args} label="Required *" id="required-state" required />
      <Textarea
        {...args}
        label="Many Rows"
        id="many-rows"
        rows={10}
        placeholder="Large text area"
      />
    </div>
  {/snippet}
</Story>
