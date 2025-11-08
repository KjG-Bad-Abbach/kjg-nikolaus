<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SummaryCard from './SummaryCard.svelte';

  const { Story } = defineMeta({
    component: SummaryCard,
    title: 'Components/Summary/SummaryCard',
    tags: ['autodocs'],
    argTypes: {
      onEdit: { action: 'edit' },
    },
  });
</script>

{#snippet defaultContent()}
  <p class="text-gray-700">Name: Max Mustermann</p>
  <p class="text-gray-700">Email: max@example.com</p>
{/snippet}

<Story
  name="Playground"
  args={{
    title: 'Contact Information',
    children: defaultContent,
  }}
/>

<Story name="With Missing Fields Warning">
  <SummaryCard title="Personal Details" onEdit={() => {}}>
    <p class="text-gray-700">Name: Max Mustermann</p>
    <p class="text-gray-700">
      Email:
      <span class="text-rust italic">(Angabe fehlt, Deadline: Fr 5.12. 19:30 Uhr)</span>
    </p>
  </SummaryCard>
</Story>

<Story name="No Content (children undefined)">
  <SummaryCard title="Empty Card" onEdit={() => {}} />
</Story>

<Story name="With Multiple Fields">
  <SummaryCard title="Contact Info" onEdit={() => {}}>
    <div class="space-y-2">
      <p class="text-gray-700">Vorname: Max</p>
      <p class="text-gray-700">Nachname: Mustermann</p>
      <p class="text-gray-700">E-Mail: max@example.com</p>
      <p class="text-gray-700">Telefonnummer: +49 123 456789</p>
    </div>
  </SummaryCard>
</Story>

<Story name="With Long Title">
  <SummaryCard title="Very Long Title That Should Display Correctly" onEdit={() => {}}>
    <p class="text-gray-700">Content here</p>
  </SummaryCard>
</Story>
