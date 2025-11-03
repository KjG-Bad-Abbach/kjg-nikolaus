<script lang="ts">
  import SummaryCard from './SummaryCard.svelte';
  import type { Location } from '$lib/types/booking';
  import { isFilled } from '$lib/utils/string';
  import { formatDateTime } from '$lib/utils/dateFormat';

  /**
   * Address summary card
   * Displays location and present location with missing field warnings
   */
  let {
    location,
    presentLocation,
    routePlanningDeadline,
    finalDeadline,
    onEdit,
  }: {
    /** Address location information */
    location: Location;
    /** Present location description */
    presentLocation: string;
    /** Route planning deadline (for address fields) */
    routePlanningDeadline: Date;
    /** Final deadline (for present location) */
    finalDeadline: Date;
    /** Callback when edit button is clicked */
    onEdit: () => void;
  } = $props();

  const routeDeadlineText = $derived(formatDateTime(routePlanningDeadline));
  const finalDeadlineText = $derived(formatDateTime(finalDeadline));
</script>

<SummaryCard title="Adresse und Ort für Geschenke" {onEdit}>
  <p class="text-gray-700">
    Straße: <span>{location?.street}</span>{#if !isFilled(location?.street)}<span
        class="text-rust italic"
      >
        (Angabe fehlt, Deadline:
        <span>{routeDeadlineText}</span>)</span
      >{/if}
  </p>
  <p class="text-gray-700">
    Hausnummer:
    <span>{location?.house_number}</span>{#if !isFilled(location?.house_number)}<span
        class="text-rust italic"
      >
        (Angabe fehlt, Deadline:
        <span>{routeDeadlineText}</span>)</span
      >{/if}
  </p>
  <p class="text-gray-700">
    PLZ: <span>{location?.zip_code}</span>{#if !isFilled(location?.zip_code)}<span
        class="text-rust italic"
      >
        (Angabe fehlt, Deadline:
        <span>{routeDeadlineText}</span>)</span
      >{/if}
  </p>
  <p class="text-gray-700">
    Ort: <span>{location?.place}</span>{#if !isFilled(location?.place)}<span
        class="text-rust italic"
      >
        (Angabe fehlt, Deadline:
        <span>{routeDeadlineText}</span>)</span
      >{/if}
  </p>
  <p class="text-gray-700">
    Ort für Geschenke:
    <span>{presentLocation}</span>{#if !isFilled(presentLocation)}<span class="text-rust italic">
        (Angabe fehlt, Deadline:
        <span>{finalDeadlineText}</span>)</span
      >{/if}
  </p>
</SummaryCard>
