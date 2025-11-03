<script lang="ts">
  import { formatDateTime } from '$lib/utils/dateFormat';

  /**
   * Summary step - confirmation page showing completion status
   */
  let {
    isRoutePlanningFilled,
    isEverythingFilled,
    routePlanningDeadline,
    finalDeadline,
  }: {
    /** Whether route planning information is complete */
    isRoutePlanningFilled: boolean;
    /** Whether all information is complete */
    isEverythingFilled: boolean;
    /** Route planning deadline */
    routePlanningDeadline: Date;
    /** Final deadline for all details */
    finalDeadline: Date;
  } = $props();

  const routeDeadlineText = $derived(formatDateTime(routePlanningDeadline));
  const finalDeadlineText = $derived(formatDateTime(finalDeadline));
</script>

<div class="mx-auto w-full max-w-3xl p-4" data-testid="qa-step-panel-summary">
  <h2 class="mb-4 text-2xl font-bold text-calypso">Vielen Dank für deine Anmeldung.</h2>

  <!-- Route planning is filled -->
  {#if isRoutePlanningFilled && !isEverythingFilled}
    <div
      class="mb-4 flex items-start gap-2 text-left text-gray-700"
      data-testid="qa-summary-route-complete"
    >
      <div class="flex-shrink-0">
        <svg
          class="h-6 w-6 text-atlantis"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          data-slot="icon"
        >
          <path
            clip-rule="evenodd"
            fill-rule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
          ></path>
        </svg>
      </div>
      <p>Für unsere Routenplanung haben wir nun alle Informationen.</p>
    </div>
  {/if}

  <!-- Route planning is missing -->
  {#if !isRoutePlanningFilled}
    <div
      class="mb-4 flex items-start gap-2 text-left text-rust"
      data-testid="qa-summary-route-missing"
    >
      <div class="flex-shrink-0">
        <svg
          class="h-6 w-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          data-slot="icon"
        >
          <path
            clip-rule="evenodd"
            fill-rule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
          ></path>
        </svg>
      </div>
      <p>
        Bitte ergänze bis zum
        <span class="font-bold">{routeDeadlineText}</span>
        die Adresse und die Zeitslots, damit wir die Routen für die Nikoläuse erstellen können.
      </p>
    </div>
  {/if}

  <!-- Something is missing -->
  {#if !isEverythingFilled}
    <div
      class="mb-4 flex items-start gap-2 text-left text-rust"
      data-testid="qa-summary-details-missing"
    >
      <div class="flex-shrink-0">
        <svg
          class="h-6 w-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          data-slot="icon"
        >
          <path
            clip-rule="evenodd"
            fill-rule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
          ></path>
        </svg>
      </div>
      <p>
        Bitte ergänze bis zum
        <span class="font-bold">{finalDeadlineText}</span>
        die noch fehlenden Details für die Nikoläuse. Nutze dafür jederzeit den Link in der Bestätigungs-E-Mail.
        Deine Angaben helfen uns, den Nikolausbesuch für deine Kinder so persönlich und schön wie möglich
        zu gestalten.
      </p>
    </div>
  {/if}

  <!-- Success -->
  {#if isEverythingFilled}
    <p class="mb-4 text-gray-700" data-testid="qa-summary-all-complete">
      Wir haben alle erforderlichen Informationen erhalten.
    </p>
    <div
      class="my-6 flex items-center justify-center text-atlantis"
      data-testid="qa-summary-checkmark"
    >
      <svg
        class="h-32 w-32"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        data-slot="icon"
      >
        <path
          clip-rule="evenodd"
          fill-rule="evenodd"
          d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        ></path>
      </svg>
    </div>
  {/if}

  <!-- Info -->
  <div class="mb-4 flex items-start gap-2 text-left text-calypso">
    <div class="flex-shrink-0">
      <svg
        class="h-6 w-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        data-slot="icon"
      >
        <path
          clip-rule="evenodd"
          fill-rule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
        ></path>
      </svg>
    </div>
    <p>
      Sobald wir die Routen geplant haben, erhältst du eine Rückmeldung, welchen Zeitslot wir für
      dich vorsehen.
    </p>
  </div>

  <div class="mb-4 flex items-start gap-2 text-left text-calypso">
    <div class="flex-shrink-0">
      <svg
        class="h-6 w-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        data-slot="icon"
      >
        <path
          clip-rule="evenodd"
          fill-rule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
        ></path>
      </svg>
    </div>
    <p>
      Du kannst deine Angaben jederzeit bis zur jeweiligen Deadline ändern. Nutze dafür den Link aus
      der Bestätigungs-E-Mail.
    </p>
  </div>
</div>
