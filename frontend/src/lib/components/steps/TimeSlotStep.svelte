<script lang="ts">
  import type { TimeSlot } from '$lib/types/booking';
  import { formatDateTime, formatTimeSlotGroup } from '$lib/utils/dateFormat';

  /**
   * Time slot selection step form
   * Allows users to select multiple time slots with search and grouping
   */
  let {
    availableTimeSlots,
    selectedTimeSlotIds,
    maxTimeSlots,
    routePlanningDeadline,
    canEditRoutePlanning,
    showSearch,
    validationMessages,
    onChange,
    onSubmit,
  }: {
    /** Available time slots */
    availableTimeSlots: TimeSlot[];
    /** Currently selected time slot IDs */
    selectedTimeSlotIds: string[];
    /** Maximum number of slots that can be selected */
    maxTimeSlots: number;
    /** Route planning deadline */
    routePlanningDeadline: Date;
    /** Whether route planning can be edited */
    canEditRoutePlanning: boolean;
    /** Whether to show search input */
    showSearch: boolean;
    /** Validation error messages keyed by field path */
    validationMessages: Record<string, string[]>;
    /** Callback when selection changes */
    onChange: (selectedIds: string[]) => void;
    /** Callback when form is submitted */
    onSubmit: (event: Event) => void;
  } = $props();

  const deadlineText = $derived(formatDateTime(routePlanningDeadline));
  const hasValidationErrors = $derived(Object.keys(validationMessages).length > 0);
  const isMaxReached = $derived(selectedTimeSlotIds.length >= maxTimeSlots);
  const isUnderMin = $derived(selectedTimeSlotIds.length < maxTimeSlots);

  let searchQuery = $state('');

  // Group time slots by date
  const groupedSlots = $derived.by(() => {
    const groups: Record<string, TimeSlot[]> = {};

    for (const slot of availableTimeSlots) {
      const date = new Date(slot.start);
      const dateKey = formatTimeSlotGroup(date);

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
    }

    return groups;
  });

  // Filter slots by search query
  const filteredGroupedSlots = $derived.by(() => {
    if (!searchQuery) return groupedSlots;

    const filtered: Record<string, TimeSlot[]> = {};
    const lowerQuery = searchQuery.toLowerCase();

    for (const [dateKey, slots] of Object.entries(groupedSlots)) {
      const matchingSlots = slots.filter((slot) => slot.label?.toLowerCase().includes(lowerQuery));

      if (matchingSlots.length > 0) {
        filtered[dateKey] = matchingSlots;
      }
    }

    return filtered;
  });

  function toggleTimeSlot(slotId: string) {
    if (!canEditRoutePlanning) return;

    const isSelected = selectedTimeSlotIds.includes(slotId);

    if (isSelected) {
      // Remove from selection
      onChange(selectedTimeSlotIds.filter((id) => id !== slotId));
    } else {
      // Add to selection if not at max
      if (selectedTimeSlotIds.length < maxTimeSlots) {
        onChange([...selectedTimeSlotIds, slotId]);
      }
    }
  }

  function removeTimeSlot(slotId: string) {
    onChange(selectedTimeSlotIds.filter((id) => id !== slotId));
  }

  function isSlotSelected(slotId: string): boolean {
    return selectedTimeSlotIds.includes(slotId);
  }

  function isSlotDisabled(slotId: string): boolean {
    // Disabled if max reached and not already selected
    return isMaxReached && !isSlotSelected(slotId);
  }

  function getSlotLabel(slotId: string): string {
    const slot = availableTimeSlots.find((s) => s.id === slotId);
    return slot?.label || '';
  }
</script>

<div class="mx-auto w-full max-w-3xl rounded-lg bg-white p-6 shadow-md">
  {#if canEditRoutePlanning}
    <h2 class="mb-4 text-2xl font-bold text-surfie-green">
      Wähle
      <span class="text-3xl font-bold underline">{maxTimeSlots}</span>
      unterschiedliche Zeitslots
    </h2>
  {:else}
    <h2 class="mb-4 text-2xl font-bold text-surfie-green">Ausgewählte Zeitslots</h2>
  {/if}

  <p class="text-gray-600 italic">
    Hinweis: Deadline für diese Angaben
    <span class="font-semibold">{deadlineText}</span>.
  </p>
  {#if !canEditRoutePlanning}
    <p class="mb-4 text-sm text-rust italic">
      (Nach der Deadline können die Angaben nicht mehr bearbeitet werden)
    </p>
  {/if}

  {#if canEditRoutePlanning && isMaxReached}
    <p class="mt-2 text-rust">
      Du kannst maximal <span>{maxTimeSlots}</span> Zeitslots auswählen.
    </p>
  {/if}

  {#if showSearch}
    <div class="mt-2 mb-4">
      <input
        type="text"
        class="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-atlantis focus:ring-atlantis"
        bind:value={searchQuery}
        placeholder="Suche nach Zeitslots..."
        data-testid="qa-time-slot-search"
      />
    </div>
  {/if}

  {#if canEditRoutePlanning}
    <div class="space-y-6">
      {#each Object.entries(filteredGroupedSlots) as [dateKey, slots] (dateKey)}
        <div>
          <h4 class="mb-2 text-lg font-medium text-surfie-green">{dateKey}</h4>
          <div class="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {#each slots as slot (slot.id)}
              <label
                class:border-gray-200={!isSlotSelected(slot.id)}
                class:border-atlantis={isSlotSelected(slot.id)}
                class:border-2={isSlotSelected(slot.id)}
                class:m-0.5={!isSlotSelected(slot.id)}
                class="flex items-center rounded-lg border p-3 shadow-sm"
                data-testid={`qa-time-slot-${slot.id}`}
              >
                <input
                  type="checkbox"
                  class="peer form-checkbox h-5 w-5 text-calypso"
                  checked={isSlotSelected(slot.id)}
                  disabled={isSlotDisabled(slot.id)}
                  onchange={() => toggleTimeSlot(slot.id)}
                />
                <span class="ml-2 text-gray-800 select-none peer-disabled:text-gray-300">
                  {slot.label}
                </span>
              </label>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if selectedTimeSlotIds.length > 0}
    <div class="mt-6">
      {#if canEditRoutePlanning}
        <h4 class="mb-2 text-lg font-medium text-surfie-green">Ausgewählte Zeitslots:</h4>
      {/if}
      <ul class="space-y-2">
        {#each selectedTimeSlotIds as slotId (slotId)}
          <li
            class="flex items-center justify-between rounded-md bg-gray-100 p-2"
            data-testid={`qa-selected-time-slot-${slotId}`}
          >
            <span>{getSlotLabel(slotId)}</span>
            {#if canEditRoutePlanning}
              <button
                type="button"
                onclick={() => removeTimeSlot(slotId)}
                data-testid={`qa-remove-selected-slot-${slotId}`}
                aria-label="Zeitslot entfernen"
                class="focus:ring-opacity-50 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-java-500 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <form data-testid="qa-time-slot-form" class="space-y-6" onsubmit={onSubmit}>
    {#if canEditRoutePlanning && isUnderMin}
      <p class="mt-4 text-rust">
        Bitte wähle mindestens <span>{maxTimeSlots}</span> Zeitslots. Damit wir eine bestmögliche Fahrroute
        für unsere Nikoläuse erstellen können.
      </p>
    {/if}

    <!-- Submit Button -->
    {#if canEditRoutePlanning}
      <div class="mt-6">
        <button
          type="submit"
          data-testid="qa-time-slot-submit"
          class="focus:ring-opacity-50 w-full rounded bg-atlantis px-4 py-2 font-bold text-white hover:bg-surfie-green focus:ring-2 focus:ring-java focus:outline-none"
        >
          Speichern & Weiter
        </button>
        {#if hasValidationErrors}
          <div class="mx-2 mt-2 text-left text-sm text-rust">Bitte überprüfe deine Eingaben.</div>
        {/if}
      </div>
    {/if}
  </form>
</div>
