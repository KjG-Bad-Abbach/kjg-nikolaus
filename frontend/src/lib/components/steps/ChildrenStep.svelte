<script lang="ts">
  import type { Child } from '$lib/types/booking';
  import { formatDateTime } from '$lib/utils/dateFormat';

  /**
   * Children details step form
   * Allows adding/removing children with their information and additional notes
   */
  export type Props = {
    /** List of children */
    children: Child[];
    /** Additional notes for the visit */
    additionalNotes: string;
    /** Final deadline for data completion */
    finalDeadline: Date;
    /** Whether any editing is allowed */
    canEditAnything: boolean;
    /** Validation error messages keyed by field path */
    validationMessages: Record<string, string[]>;
    /** Callback when data changes */
    onChange?: (data: { children: Child[]; additionalNotes: string }) => void;
    /** Callback when form is submitted */
    onSubmit?: (data: { children: Child[]; additionalNotes: string }) => void;
  };

  const {
    children,
    additionalNotes,
    finalDeadline,
    canEditAnything,
    validationMessages,
    onChange,
    onSubmit,
  }: Props = $props();

  const deadlineText = $derived(formatDateTime(finalDeadline));
  const hasNoChildren = $derived(children.length === 0);

  // Local reactive state
  let localChildren = $derived<Child[]>(children.map((c) => ({ ...c })));
  let localAdditionalNotes = $derived(additionalNotes);

  function handleChange() {
    onChange?.({
      children: localChildren,
      additionalNotes: localAdditionalNotes,
    });
  }

  function addChild() {
    localChildren = [...localChildren, { name: '', identification_trait: '', speech: '' }];
    handleChange();
  }

  function removeChild(index: number) {
    localChildren = localChildren.filter((_, i) => i !== index);
    handleChange();
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    onSubmit?.({
      children: localChildren,
      additionalNotes: localAdditionalNotes,
    });
  }
</script>

<div class="mx-auto w-full max-w-3xl rounded-lg bg-white p-6 shadow-md">
  <h2 class="mb-4 text-2xl font-bold text-surfie-green">Kinder</h2>

  <p class="text-gray-600 italic">
    Hinweis: Die Informationen zu den Kindern können auch später ergänzt werden. Deadline für diese
    Angaben
    <span class="font-semibold">{deadlineText}</span>.
  </p>
  {#if !canEditAnything}
    <p class="mb-4 text-sm text-rust italic">
      (Nach der Deadline können die Angaben nicht mehr bearbeitet werden)
    </p>
  {/if}

  <div
    class="mt-2 rounded-md border border-gray-300 bg-gray-50 p-3 text-left text-sm text-gray-700"
  >
    <p>
      Der Nikolaus erhält im Vorfeld Informationen zu den Kindern, sodass das goldene Buch
      individuell gefüllt werden kann. Eine solche Information sollte den Namen, ein eindeutiges
      Identifikationsmerkmal sowie Lob und ggf. Tadel enthalten.
    </p>
    <p class="mt-3">
      Bitte erwarten Sie in dieser kurzen Zeit keine pädagogischen Wunder. Nutzen Sie die
      Gelegenheit Ihre Kinder zu
      <b>loben</b> und <b>einen</b> oder maximal zwei Verbesserungsimpulse zu geben.
    </p>
    <p class="mt-3 font-semibold">Beispiele:</p>
    <ul class="ml-6 list-outside list-disc">
      <li>
        <b>Kasimir</b> (8 Jahre, dunkle Haare, größtes Kind)<br />
        <span class="text-emerald-700">+</span> kann toll zeichnen, Kunst ist das Lieblingsfach in
        der 3. Klasse<br />
        <span class="text-rust">–</span> ärgert seine Schwester oft
      </li>
      <li>
        <b>Jule</b> (6 Jahre, lange blonde Haare)<br />
        <span class="text-emerald-700">+</span> sehr aufgewecktes Kind, in der ersten Klasse, freut
        sich jeden Tag auf die Schule und zieht sich schon ganz alleine an<br />
        <span class="text-rust">–</span> schreit sehr laut, wenn sie sich mit ihrem Bruder Kasimir streitet
      </li>
      <li>
        <b>Gustl</b> (2 Jahre, kleinstes Kind)<br />
        <span class="text-emerald-700">+</span> großer Feuerwehr-Fan, liebt seine Geschwister über
        alles, sagt immer Bitte und Danke<br />
        <span class="text-rust">–</span> stört Geschwister bei den Hausaufgaben und akzeptiert nicht,
        dass sie auch Zeit ohne ihn brauchen
      </li>
    </ul>
  </div>

  {#if canEditAnything && hasNoChildren}
    <p class="mt-6 text-rust">Bitte füge mindestens ein Kind hinzu.</p>
  {/if}

  <form data-testid="qa-children-form" class="mt-6 space-y-6" onsubmit={handleSubmit}>
    <!-- List of children -->
    {#each localChildren as child, index (index)}
      <div class="space-y-4 rounded-lg border border-gray-300 bg-gray-100 p-4">
        <div>
          <label for={`child-name-${index}`} class="block text-left font-medium text-surfie-green"
            >Name *</label
          >
          <input
            id={`child-name-${index}`}
            data-testid={`qa-child-name-${index}`}
            type="text"
            required
            maxlength="50"
            class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
            bind:value={child.name}
            oninput={handleChange}
            placeholder="Name des Kindes"
            readonly={!canEditAnything}
          />
          {#each validationMessages[`booking.children[${index}].name`] || [] as message, msgIndex (msgIndex)}
            <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
          {/each}
        </div>

        <div>
          <label
            for={`child-identification-${index}`}
            class="block text-left font-medium text-surfie-green">Identifikationsmerkmal</label
          >
          <input
            id={`child-identification-${index}`}
            data-testid={`qa-child-identification-${index}`}
            type="text"
            maxlength="250"
            class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
            bind:value={child.identification_trait}
            oninput={handleChange}
            placeholder="Alter, Haarfarbe, Größe, ..."
            readonly={!canEditAnything}
          />
          {#each validationMessages[`booking.children[${index}].identification_trait`] || [] as message, msgIndex (msgIndex)}
            <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
          {/each}
        </div>

        <div>
          <label for={`child-speech-${index}`} class="block text-left font-medium text-surfie-green"
            >Rede</label
          >
          <div
            class="mt-2 rounded-md border border-gray-300 bg-gray-50 p-3 text-left text-sm text-gray-700"
          >
            <p>
              Bitte schreib hier den Text rein, den der Nikolaus für ein Kind vorlesen soll. Gerne
              in Stichpunkten oder auch als Fließtext.
            </p>
          </div>
          <textarea
            id={`child-speech-${index}`}
            data-testid={`qa-child-speech-${index}`}
            class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
            bind:value={child.speech}
            oninput={handleChange}
            rows="8"
            placeholder="Rede für den Nikolaus"
            readonly={!canEditAnything}
          ></textarea>
          {#each validationMessages[`booking.children[${index}].speech`] || [] as message, msgIndex (msgIndex)}
            <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
          {/each}
        </div>
        {#if canEditAnything}
          <button
            type="button"
            onclick={() => removeChild(index)}
            data-testid={`qa-remove-child-${index}`}
            class="mt-2 rounded-sm bg-red-500 px-3 py-1 text-sm font-bold text-white hover:bg-red-600 focus:ring-2 focus:ring-rust/50 focus:outline-hidden"
          >
            Kind entfernen
          </button>
        {/if}
      </div>
    {/each}

    <!-- Add child button -->
    {#if canEditAnything}
      <div class="mt-4">
        <button
          type="button"
          onclick={addChild}
          data-testid="qa-add-child"
          class="rounded-sm bg-atlantis px-4 py-2 font-bold text-white hover:bg-surfie-green focus:ring-2 focus:ring-java/50 focus:outline-hidden"
        >
          Kind hinzufügen
        </button>
      </div>
    {/if}

    <!-- Additional Notes -->
    <div>
      <label for="additional_notes" class="block text-left font-medium text-surfie-green"
        >Sonstige Beachtungen</label
      >
      <div
        class="mt-2 rounded-md border border-gray-300 bg-gray-50 p-3 text-left text-sm text-gray-700"
      >
        <p>
          Hier kannst du weitere wichtige Informationen für die Nikoläuse hinterlegen, z. B. die
          Kinder wollen dem Nikolaus ein Lied singen / Besonderheiten zu Hunden / Haustieren, zum
          Haus / Grundstück oder sonstige Hinweise.
        </p>
      </div>
      <textarea
        id="additional_notes"
        data-testid="qa-additional-notes"
        class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-xs focus:border-atlantis focus:ring-atlantis"
        bind:value={localAdditionalNotes}
        oninput={handleChange}
        rows="4"
        placeholder="Weitere Hinweise für den Nikolaus"
        readonly={!canEditAnything}
      ></textarea>
      {#each validationMessages['booking.additional_notes'] || [] as message, index (index)}
        <div class="mx-2 mt-2 text-left text-sm text-rust">{message}</div>
      {/each}
    </div>

    <!-- Submit Button -->
    {#if canEditAnything}
      <div>
        <button
          type="submit"
          data-testid="qa-children-submit"
          class="w-full rounded-sm bg-atlantis px-4 py-2 font-bold text-white hover:bg-surfie-green focus:ring-2 focus:ring-java/50 focus:outline-hidden"
        >
          Speichern & Weiter
        </button>
      </div>
    {/if}
  </form>
</div>
