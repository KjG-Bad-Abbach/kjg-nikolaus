<script lang="ts">
  import SummaryCard from './SummaryCard.svelte';
  import type { TimeSlot } from '$lib/types/booking';
  import { formatDateTime } from '$lib/utils/dateFormat';

  /**
   * Time slot summary card
   * Displays selected time slots with missing field warnings
   */
  export type Props = {
    /** Array of selected time slots */
    selectedTimeSlots: TimeSlot[];
    /** Maximum number of time slots that can be selected */
    maxTimeSlots: number;
    /** Route planning deadline */
    routePlanningDeadline: Date;
    /** Callback when edit button is clicked */
    onEdit?: () => void;
  };

  const { selectedTimeSlots, maxTimeSlots, routePlanningDeadline, onEdit }: Props = $props();

  const deadlineText = $derived(formatDateTime(routePlanningDeadline));
</script>

<SummaryCard title="Ausgewählte Zeitslots" {onEdit}>
  <ul>
    {#each selectedTimeSlots as slot (slot.id)}
      <li class="text-gray-700">
        {slot.label}
      </li>
    {/each}
    {#if selectedTimeSlots.length === 0}
      <li class="text-rust italic">
        (Angabe fehlt, Deadline:
        <span>{deadlineText}</span>)
      </li>
    {/if}
    {#if selectedTimeSlots.length > 0 && selectedTimeSlots.length < maxTimeSlots}
      <li class="text-rust italic">
        (Bitte <span>{maxTimeSlots}</span> Zeitslots auswählen, Deadline:
        <span>{deadlineText}</span>)
      </li>
    {/if}
  </ul>
</SummaryCard>
