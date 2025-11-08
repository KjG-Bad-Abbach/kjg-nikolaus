<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Textarea from './Textarea.svelte';

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

<Story name="Default">
  <Textarea label="Additional Notes" id="notes" placeholder="Enter additional notes" />
</Story>

<Story name="Without Label">
  <Textarea id="no-label" placeholder="Textarea without label" />
</Story>

<Story name="Few Rows (2)">
  <Textarea label="Short Message" id="short" rows={2} placeholder="Brief message" />
</Story>

<Story name="Standard Rows (4)">
  <Textarea label="Standard Message" id="standard" rows={4} placeholder="Standard message area" />
</Story>

<Story name="Many Rows (8)">
  <Textarea label="Speech" id="speech" rows={8} placeholder="Rede für den Nikolaus" />
</Story>

<Story name="Very Many Rows (15)">
  <Textarea label="Long Essay" id="essay" rows={15} placeholder="Write your essay here" />
</Story>

<Story name="With Error">
  <Textarea label="Description" id="description-error" error="This field is required" />
</Story>

<Story name="Readonly">
  <Textarea
    label="Description"
    id="description-readonly"
    value="This is readonly content"
    readonly
  />
</Story>

<Story name="With Value">
  <Textarea label="Notes" id="notes-value" value="Some existing notes here" rows={4} />
</Story>

<Story name="Long Value">
  <div class="max-w-md">
    <Textarea
      label="Long Text"
      id="long-value"
      rows={6}
      value="This is a very long text that spans multiple lines and demonstrates how the textarea handles lengthy content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    />
  </div>
</Story>

<Story name="Disabled">
  <Textarea label="Disabled Field" id="disabled-textarea" value="Cannot edit" disabled />
</Story>

<Story name="Custom Classes">
  <Textarea
    label="Custom Styled"
    id="custom"
    class="ring-2 ring-atlantis"
    placeholder="Custom style"
  />
</Story>

<Story name="Required">
  <Textarea
    label="Required Field *"
    id="required-textarea"
    required
    placeholder="This field is required"
  />
</Story>

<Story name="With Placeholder">
  <Textarea
    label="Comments"
    id="with-placeholder"
    placeholder="Please enter your comments here..."
  />
</Story>

<Story name="All States Comparison">
  <div class="space-y-4">
    <Textarea label="Normal" id="normal" placeholder="Normal textarea" />
    <Textarea label="With Value" id="with-value" value="Some content" rows={3} />
    <Textarea label="With Error" id="with-error" value="Invalid" error="Content is too short" />
    <Textarea label="Readonly" id="readonly-state" value="Cannot edit this text" readonly />
    <Textarea label="Disabled" id="disabled-state" value="Cannot edit this text" disabled />
    <Textarea label="Required *" id="required-state" required />
    <Textarea label="Many Rows" id="many-rows" rows={10} placeholder="Large text area" />
  </div>
</Story>
