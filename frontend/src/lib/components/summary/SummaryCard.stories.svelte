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

<Story name="Default">
  <p class="text-gray-700">Name: Max Mustermann</p>
  <p class="text-gray-700">Email: max@example.com</p>
</Story>

<Story name="With Missing Fields">
  <p class="text-gray-700">Name: Max Mustermann</p>
  <p class="text-gray-700">
    Email:
    <span class="text-rust italic">(Angabe fehlt, Deadline: Fr 5.12. 19:30 Uhr)</span>
  </p>
</Story>

<Story name="Contact Info">
  <p class="text-gray-700">Vorname: Max</p>
  <p class="text-gray-700">Nachname: Mustermann</p>
  <p class="text-gray-700">E-Mail: max@example.com</p>
  <p class="text-gray-700">Telefonnummer: +49 123 456789</p>
</Story>
