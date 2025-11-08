<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    component: Button,
    title: 'Components/Primitives/Button',
    tags: ['autodocs'],
    argTypes: {
      variant: {
        control: 'select',
        options: ['primary', 'secondary'],
      },
      type: {
        control: 'select',
        options: ['button', 'submit', 'reset'],
      },
      disabled: { control: 'boolean' },
      fullWidth: { control: 'boolean' },
    },
  });
</script>

{#snippet buttonText()}
  Click Me
{/snippet}

<Story
  name="Playground"
  args={{
    variant: 'primary',
    type: 'button',
    disabled: false,
    fullWidth: false,
    children: buttonText,
  }}
/>

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

<Story name="Button Types">
  <div class="space-y-4">
    <div>
      <Button type="button">Type: Button (default)</Button>
    </div>
    <div>
      <Button type="submit">Type: Submit</Button>
    </div>
    <div>
      <Button type="reset">Type: Reset</Button>
    </div>
  </div>
</Story>

<Story name="Long Text">
  <div class="max-w-xs">
    <Button>This is a button with very long text that might overflow</Button>
  </div>
</Story>

<Story name="Custom Classes">
  <Button class="shadow-lg">Button with Custom Shadow</Button>
</Story>

<Story name="All Variants Comparison">
  <div class="space-y-4">
    <div class="space-x-2">
      <Button>Primary Default</Button>
      <Button variant="secondary">Secondary Default</Button>
    </div>
    <div class="space-x-2">
      <Button disabled>Primary Disabled</Button>
      <Button variant="secondary" disabled>Secondary Disabled</Button>
    </div>
    <div>
      <Button fullWidth>Full Width Primary</Button>
    </div>
    <div>
      <Button variant="secondary" fullWidth>Full Width Secondary</Button>
    </div>
  </div>
</Story>
