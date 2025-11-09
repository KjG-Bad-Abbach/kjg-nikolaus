<script lang="ts">
  import type { ContactPerson } from '$lib/types/booking';
  import { formatDateTime } from '$lib/utils/dateFormat';

  /**
   * Contact details step form
   * Collects first name, last name, email, and phone number
   */
  export type Props = {
    /** Contact person information */
    contactPerson: ContactPerson;
    /** Final deadline for data completion */
    finalDeadline: Date;
    /** Whether editing is allowed */
    canEdit: boolean;
    /** Validation error messages keyed by field path */
    validationMessages: Record<string, string[]>;
    /** Callback when field values change */
    onChange?: (contactPerson: ContactPerson) => void;
    /** Callback when form is submitted */
    onSubmit?: (contactPerson: ContactPerson) => void;
  };

  const { contactPerson, finalDeadline, canEdit, validationMessages, onChange, onSubmit }: Props =
    $props();

  const deadlineText = $derived(formatDateTime(finalDeadline));
  const hasValidationErrors = $derived(Object.keys(validationMessages).length > 0);

  // Local reactive state for form fields
  let first_name = $derived(contactPerson.first_name);
  let last_name = $derived(contactPerson.last_name);
  let email = $derived(contactPerson.email);
  let phone_number = $derived(contactPerson.phone_number);

  // Sync local state back to parent on change
  function handleChange() {
    onChange?.({
      first_name,
      last_name,
      email,
      phone_number,
    });
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    onSubmit?.({
      first_name,
      last_name,
      email,
      phone_number,
    });
  }
</script>

<div class="mx-auto w-full max-w-3xl rounded-lg bg-white p-6 shadow-md">
  <h2 class="mb-4 text-2xl font-bold text-surfie-green">Kontaktinformationen</h2>

  <p class="text-gray-600 italic">
    Hinweis: Deadline für diese Angaben
    <span class="font-semibold">{deadlineText}</span>.
  </p>
  {#if !canEdit}
    <p class="mb-4 text-sm text-rust italic">
      (Nach der Deadline können die Angaben nicht mehr bearbeitet werden)
    </p>
  {/if}

  <form data-testid="qa-contact-form" class="space-y-6" onsubmit={handleSubmit}>
    <div>
      <label for="first_name" class="block text-left font-medium text-surfie-green">Vorname *</label
      >
      <input
        type="text"
        id="first_name"
        data-testid="qa-contact-first-name"
        required
        class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
        bind:value={first_name}
        oninput={handleChange}
        maxlength="50"
        placeholder="Vorname"
        readonly={!canEdit}
      />
      {#each validationMessages['booking.contact_person.first_name'] || [] as message, index (index)}
        <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
      {/each}
    </div>

    <div>
      <label for="last_name" class="block text-left font-medium text-surfie-green">Nachname *</label
      >
      <input
        type="text"
        id="last_name"
        data-testid="qa-contact-last-name"
        required
        class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
        bind:value={last_name}
        oninput={handleChange}
        maxlength="50"
        placeholder="Nachname"
        readonly={!canEdit}
      />
      {#each validationMessages['booking.contact_person.last_name'] || [] as message, index (index)}
        <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
      {/each}
    </div>

    <div>
      <label for="email" class="block text-left font-medium text-surfie-green">E-Mail *</label>
      <input
        type="email"
        id="email"
        data-testid="qa-contact-email"
        required
        class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
        bind:value={email}
        oninput={handleChange}
        maxlength="100"
        placeholder="example@example.com"
        readonly={!canEdit}
      />
      {#each validationMessages['booking.contact_person.email'] || [] as message, index (index)}
        <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
      {/each}
    </div>

    <div>
      <label for="phone_number" class="block text-left font-medium text-surfie-green"
        >Telefonnummer *</label
      >
      <input
        type="tel"
        id="phone_number"
        data-testid="qa-contact-phone"
        required
        class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
        bind:value={phone_number}
        oninput={handleChange}
        maxlength="50"
        placeholder="0123 4567890"
        readonly={!canEdit}
      />
      {#each validationMessages['booking.contact_person.phone_number'] || [] as message, index (index)}
        <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
      {/each}
    </div>

    <!-- Submit Button -->
    {#if canEdit}
      <div>
        <button
          type="submit"
          data-testid="qa-contact-submit"
          class="w-full rounded-sm bg-atlantis px-4 py-2 font-bold text-white hover:bg-surfie-green focus:ring-2 focus:ring-java/50 focus:outline-hidden"
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
