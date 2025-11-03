<script lang="ts">
  import SummaryCard from './SummaryCard.svelte';
  import type { ContactPerson } from '$lib/types/booking';
  import { isFilled } from '$lib/utils/string';
  import { formatDateTime } from '$lib/utils/dateFormat';

  /**
   * Contact information summary card
   * Displays contact person details with missing field warnings
   */
  let {
    contactPerson,
    finalDeadline,
    onEdit,
  }: {
    /** Contact person information */
    contactPerson: ContactPerson;
    /** Final deadline for data completion */
    finalDeadline: Date;
    /** Callback when edit button is clicked */
    onEdit: () => void;
  } = $props();

  const deadlineText = $derived(formatDateTime(finalDeadline));
</script>

<SummaryCard title="Kontaktinformationen" {onEdit}>
  <p class="text-gray-700">
    Vorname:
    <span>{contactPerson?.first_name}</span>{#if !isFilled(contactPerson?.first_name)}<span
        class="text-rust italic"
      >
        (Angabe fehlt, Deadline:
        <span>{deadlineText}</span>)</span
      >{/if}
  </p>
  <p class="text-gray-700">
    Nachname:
    <span>{contactPerson?.last_name}</span>{#if !isFilled(contactPerson?.last_name)}<span
        class="text-rust italic"
      >
        (Angabe fehlt, Deadline:
        <span>{deadlineText}</span>)</span
      >{/if}
  </p>
  <p class="text-gray-700">
    E-Mail: <span>{contactPerson?.email}</span>{#if !isFilled(contactPerson?.email)}<span
        class="text-rust italic"
      >
        (Angabe fehlt, Deadline:
        <span>{deadlineText}</span>)</span
      >{/if}
  </p>
  <p class="text-gray-700">
    Telefonnummer:
    <span>{contactPerson?.phone_number}</span>{#if !isFilled(contactPerson?.phone_number)}<span
        class="text-rust italic"
      >
        (Angabe fehlt, Deadline:
        <span>{deadlineText}</span>)</span
      >{/if}
  </p>
</SummaryCard>
