<script lang="ts">
  import type { Location } from '$lib/types/booking';
  import { formatDateTime } from '$lib/utils/dateFormat';

  /**
   * Address and present location step form
   * Collects street, house number, zip code, place, and present location
   */
  let {
    location,
    presentLocation,
    routePlanningDeadline,
    finalDeadline,
    canEditRoutePlanning,
    canEditAnything,
    validationMessages,
    onChange,
    onSubmit,
  }: {
    /** Location information */
    location: Location;
    /** Present location description */
    presentLocation: string;
    /** Route planning deadline */
    routePlanningDeadline: Date;
    /** Final deadline for data completion */
    finalDeadline: Date;
    /** Whether route planning fields can be edited */
    canEditRoutePlanning: boolean;
    /** Whether any editing is allowed */
    canEditAnything: boolean;
    /** Validation error messages keyed by field path */
    validationMessages: Record<string, string[]>;
    /** Callback when field values change */
    onChange: (data: { location: Location; presentLocation: string }) => void;
    /** Callback when form is submitted */
    onSubmit: (event: Event) => void;
  } = $props();

  const routePlanningDeadlineText = $derived(formatDateTime(routePlanningDeadline));
  const finalDeadlineText = $derived(formatDateTime(finalDeadline));
  const hasValidationErrors = $derived(Object.keys(validationMessages).length > 0);

  // Local reactive state for form fields
  let street = $state(location.street);
  let house_number = $state(location.house_number);
  let zip_code = $state(location.zip_code);
  let place = $state(location.place);
  let present_location = $state(presentLocation);

  // Sync local state back to parent on change
  function handleChange() {
    onChange({
      location: {
        street,
        house_number,
        zip_code,
        place,
      },
      presentLocation: present_location,
    });
  }

  // Sync props to local state when they change
  $effect(() => {
    street = location.street;
    house_number = location.house_number;
    zip_code = location.zip_code;
    place = location.place;
    present_location = presentLocation;
  });

  // Limit zip code to 5 digits
  function handleZipInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 5) {
      input.value = input.value.slice(0, 5);
      zip_code = input.value;
    }
    handleChange();
  }
</script>

<div class="mx-auto w-full max-w-3xl rounded-lg bg-white p-6 shadow-md">
  <h2 class="mb-4 text-2xl font-bold text-surfie-green">Adresse und Ort für Geschenke</h2>

  <p class="text-gray-600 italic">
    Hinweis: Deadline für diese Angaben
    <span class="font-semibold">{routePlanningDeadlineText}</span>.
  </p>
  {#if !canEditRoutePlanning}
    <p class="mb-4 text-sm text-rust italic">
      (Nach der Deadline können die Angaben nicht mehr bearbeitet werden)
    </p>
  {/if}

  <form data-testid="qa-address-form" class="space-y-6" onsubmit={onSubmit}>
    <div>
      <label for="street" class="block text-left font-medium text-surfie-green">Straße *</label>
      <input
        type="text"
        id="street"
        data-testid="qa-address-street"
        required
        class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
        bind:value={street}
        oninput={handleChange}
        maxlength="100"
        placeholder="Straße"
        readonly={!canEditRoutePlanning}
      />
      {#each validationMessages['booking.location.street'] || [] as message, index (index)}
        <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
      {/each}
    </div>

    <div>
      <label for="house_number" class="block text-left font-medium text-surfie-green"
        >Hausnummer *</label
      >
      <input
        type="text"
        id="house_number"
        data-testid="qa-address-house-number"
        required
        class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
        bind:value={house_number}
        oninput={handleChange}
        maxlength="10"
        placeholder="Hausnummer"
        readonly={!canEditRoutePlanning}
      />
      {#each validationMessages['booking.location.house_number'] || [] as message, index (index)}
        <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
      {/each}
    </div>

    <div>
      <label for="zip_code" class="block text-left font-medium text-surfie-green">PLZ *</label>
      <input
        type="number"
        id="zip_code"
        data-testid="qa-address-zip"
        required
        class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
        bind:value={zip_code}
        oninput={handleZipInput}
        max="99999"
        min="00000"
        placeholder="PLZ"
        readonly={!canEditRoutePlanning}
      />
      {#each validationMessages['booking.location.zip_code'] || [] as message, index (index)}
        <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
      {/each}
    </div>

    <div>
      <label for="place" class="block text-left font-medium text-surfie-green">Ort *</label>
      <input
        type="text"
        id="place"
        data-testid="qa-address-place"
        required
        class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
        bind:value={place}
        oninput={handleChange}
        maxlength="100"
        placeholder="Ort"
        readonly={!canEditRoutePlanning}
      />
      {#each validationMessages['booking.location.place'] || [] as message, index (index)}
        <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
      {/each}
    </div>

    <div>
      <label for="present_location" class="block text-left font-medium text-surfie-green"
        >Ort für Geschenke</label
      >
      <p class="text-left text-gray-600 italic">
        Hinweis: Diese Information kann auch später ergänzt werden. Deadline für diese Angabe
        <span class="font-semibold">{finalDeadlineText}</span>.
      </p>
      <div
        class="mt-2 rounded-md border border-gray-300 bg-gray-50 p-3 text-left text-sm text-gray-700"
      >
        <p class="font-semibold">Beispiele:</p>
        <ul class="list-inside list-disc">
          <li>Geschenke hinter der Papiertonne in der offenen Garage</li>
          <li>
            Im Gartenhäuschen hinter dem Haus, der Schlüssel liegt unter dem Blumentopf neben der
            Tür
          </li>
          <li>Geschenke liegen in einem Sack in der Garage links neben dem Eingang</li>
          <li>
            Im Carport neben dem Auto, die Geschenke sind in einer roten Tasche mit Weihnachtsmotiv
          </li>
        </ul>
      </div>
      <input
        type="text"
        id="present_location"
        data-testid="qa-address-present-location"
        class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
        bind:value={present_location}
        oninput={handleChange}
        maxlength="200"
        placeholder="Wo können wir die Geschenke finden?"
        readonly={!canEditAnything}
      />
      {#each validationMessages['booking.present_location'] || [] as message, index (index)}
        <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
      {/each}
    </div>

    <!-- Submit Button -->
    {#if canEditAnything}
      <div>
        <button
          type="submit"
          data-testid="qa-address-submit"
          class="focus:ring-opacity-50 w-full rounded-sm bg-atlantis px-4 py-2 font-bold text-white hover:bg-surfie-green focus:ring-2 focus:ring-java focus:outline-hidden"
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
