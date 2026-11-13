<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import SummaryCard from './SummaryCard.svelte';
  import type { Props } from './SummaryCard.svelte';

  const { Story } = defineMeta({
    component: SummaryCard,
    title: 'Components/Summary/SummaryCard',
    tags: ['autodocs'],
    argTypes: {
      onEdit: { action: 'edit' },
    },
    args: {
      onEdit: fn(),
    },
  });
</script>

{#snippet template(args: Props)}
  <SummaryCard {...args}>
    <p class="text-gray-700">Content here</p>
  </SummaryCard>
{/snippet}

<Story name="Simple" args={{ title: 'Contact Information' }} {template} />

<Story name="No Content (children undefined)" args={{ title: 'Empty Card' }}>
  {#snippet template(args: Props)}
    <SummaryCard {...args} />
  {/snippet}
</Story>

<Story
  name="With Long Title"
  args={{ title: 'Very Long Title That Should Display Correctly' }}
  {template}
/>
