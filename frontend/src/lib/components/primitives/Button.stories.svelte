<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    component: Button,
    title: 'Components/Primitives/Button',
    tags: ['autodocs'],
  });
</script>

<Story name="Primary">
  <Button>Primary Button</Button>
</Story>

<Story name="Secondary">
  <Button variant="secondary">Secondary Button</Button>
</Story>

<Story name="Disabled Primary">
  <Button disabled>Disabled Primary</Button>
</Story>

<Story name="Disabled Secondary">
  <Button variant="secondary" disabled>Disabled Secondary</Button>
</Story>

<Story name="Full Width">
  <div class="w-64">
    <Button fullWidth>Full Width Button</Button>
  </div>
</Story>

<Story name="With Test ID">
  <Button data-testid="qa-story-button">Button with Test ID</Button>
</Story>

<Story name="All Variants">
  <div class="space-y-4">
    <div>
      <Button>Primary Default</Button>
    </div>
    <div>
      <Button variant="secondary">Secondary Default</Button>
    </div>
    <div>
      <Button disabled>Primary Disabled</Button>
    </div>
    <div>
      <Button variant="secondary" disabled>Secondary Disabled</Button>
    </div>
  </div>
</Story>
