<script lang="ts">
  import { renderRichText, type RichTextNode } from '$lib/utils/richTextRenderer';

  /**
   * Introduction section component
   * Displays CMS introduction text with rich text formatting and a start button
   */
  let {
    /* v8 ignore next 1 - Svelte 5 runes not properly instrumented by coverage tool */
    introductionText = [],
    onStart,
  }: {
    /** Introduction text from CMS (rich text blocks) */
    introductionText?: RichTextNode[];
    /** Callback when start button is clicked */
    onStart: () => void;
  } = $props();

  // Compute HTML content from rich text with custom Tailwind classes
  function getHtmlContent(): string {
    return renderRichText(introductionText, {
      extend: {
        heading1: 'text-calypso',
        heading2: 'text-calypso',
        heading3: 'text-calypso',
        heading4: 'text-calypso',
        heading5: 'text-calypso',
        heading6: 'text-calypso',
        list: 'marker:text-calypso',
        link: 'text-atlantis hover:text-surfie-green',
      },
    });
  }
</script>

<div
  data-testid="qa-view-intro"
  class="mx-2 my-8 space-y-6 rounded-lg bg-white p-6 text-left shadow-md"
>
  <div id="introduction-text">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html getHtmlContent()}
  </div>

  <div class="text-center">
    <button
      onclick={onStart}
      data-testid="qa-intro-start"
      class="focus:ring-opacity-50 rounded-sm bg-atlantis px-6 py-2 font-bold text-white hover:bg-surfie-green focus:ring-2 focus:ring-java focus:outline-hidden"
    >
      Jetzt anmelden
    </button>
  </div>
</div>
