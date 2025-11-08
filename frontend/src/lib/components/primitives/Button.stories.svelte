<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';
  import type { Props } from './Button.svelte';

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

{#snippet template(args: Props)}
  <Button {...args}>Click Me</Button>
{/snippet}

<Story
  name="Playground"
  args={{
    variant: 'primary',
    type: 'button',
    disabled: false,
    fullWidth: false,
  }}
  {template}
/>

<Story name="Primary" {template} />

<Story name="Secondary" args={{ variant: 'secondary' }} {template} />

<Story name="Disabled Primary" args={{ disabled: true }} {template} />

<Story name="Disabled Secondary" args={{ variant: 'secondary', disabled: true }} {template} />

<Story name="Full Width" args={{ fullWidth: true }} {template} />

<Story name="With Test ID" args={{ 'data-testid': 'qa-story-button' }} {template} />

<Story name="Button Types">
  {#snippet template(args: Props)}
    <div class="space-y-4">
      <div>
        <Button {...args} type="button">Type: Button (default)</Button>
      </div>
      <div>
        <Button {...args} type="submit">Type: Submit</Button>
      </div>
      <div>
        <Button {...args} type="reset">Type: Reset</Button>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Long Text">
  {#snippet template(args: Props)}
    <div class="max-w-xs">
      <Button {...args}>This is a button with very long text that might overflow</Button>
    </div>
  {/snippet}
</Story>

<Story name="Custom Classes (Shadow)" args={{ class: 'shadow-lg' }} {template} />

<Story name="All Variants Comparison">
  {#snippet template(args: Props)}
    <div class="space-y-4">
      <div class="space-x-2">
        <Button {...args}>Primary Default</Button>
        <Button {...args} variant="secondary">Secondary Default</Button>
      </div>
      <div class="space-x-2">
        <Button {...args} disabled>Primary Disabled</Button>
        <Button {...args} variant="secondary" disabled>Secondary Disabled</Button>
      </div>
      <div>
        <Button {...args} fullWidth>Full Width Primary</Button>
      </div>
      <div>
        <Button {...args} variant="secondary" fullWidth>Full Width Secondary</Button>
      </div>
    </div>
  {/snippet}
</Story>
