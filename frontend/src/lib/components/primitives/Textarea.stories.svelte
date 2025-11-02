<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Textarea from './Textarea.svelte';

  const { Story } = defineMeta({
    component: Textarea,
    title: 'Components/Primitives/Textarea',
    tags: ['autodocs'],
  });
</script>

<Story name="Default">
  <Textarea label="Additional Notes" id="notes" placeholder="Enter additional notes" />
</Story>

<Story name="With Rows">
  <Textarea label="Speech" id="speech" rows={8} placeholder="Rede für den Nikolaus" />
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

<Story name="All States">
  <div class="space-y-4">
    <Textarea label="Normal" id="normal" />
    <Textarea label="With Value" id="with-value" value="Some content" />
    <Textarea label="With Error" id="with-error" error="This field is required" />
    <Textarea label="Readonly" id="readonly-state" value="Cannot edit" readonly />
    <Textarea label="Many Rows" id="many-rows" rows={10} />
  </div>
</Story>
