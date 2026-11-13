<script lang="ts">
  import { fade } from 'svelte/transition';

  /**
   * ErrorModal Component
   *
   * Displays an error modal with:
   * - Error message
   * - Optional collapsible details (status code and body)
   * - Dismiss or Retry button
   * - Click-outside-to-close on backdrop
   */

  interface ErrorObject {
    message: string;
    status?: { code: number; text: string };
    body?: unknown;
  }

  export type Props = {
    error: ErrorObject | null;
    onClose?: () => void;
    onRetry?: () => void;
    askToReload?: boolean;
  };

  const { error, onClose, onRetry, askToReload = false }: Props = $props();

  let detailsOpen = $state(false);

  function handleBackdropClick(event: MouseEvent | KeyboardEvent) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  function toggleDetails() {
    detailsOpen = !detailsOpen;
  }
</script>

{#if error}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="button"
    tabindex="-1"
    onclick={handleBackdropClick}
    onkeydown={handleBackdropClick}
    transition:fade={{ duration: 200 }}
  >
    <!-- Modal content -->
    <div
      class="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-lg border-s-4 border-red-500 bg-red-50 p-8 text-left shadow-2xl"
      role="alert"
      data-testid="qa-error-modal"
    >
      <div class="flex items-center gap-2 text-red-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="size-5 shrink-0"
        >
          <path
            fill-rule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clip-rule="evenodd"
          />
        </svg>

        <strong class="block font-medium">
          {error.message}
        </strong>
      </div>

      {#if error.status || error.body}
        <div class="mt-4">
          <button
            type="button"
            onclick={toggleDetails}
            class="cursor-pointer text-red-700 underline"
            class:font-bold={detailsOpen}
            data-testid="qa-error-details-toggle"
          >
            Details
          </button>
          {#if detailsOpen}
            <div class="text-sm text-red-700">
              {#if error.status}
                <p>
                  <span class="font-bold">Status:</span>
                  {error.status.code} ({error.status.text})
                </p>
              {/if}
              {#if error.body}
                <p>
                  <code class="block overflow-x-scroll whitespace-pre">
                    {JSON.stringify(error.body, null, '  ')}
                  </code>
                </p>
              {/if}
            </div>
          {/if}
        </div>
      {/if}

      <div class="mt-4 flex justify-end gap-2">
        {#if askToReload}
          <button
            type="button"
            onclick={onRetry}
            data-testid="qa-error-retry"
            class="rounded-sm border-2 border-gray-400 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-java-500/50 focus:outline-hidden"
          >
            Erneut versuchen
          </button>
        {:else}
          <button
            type="button"
            onclick={onClose}
            data-testid="qa-error-dismiss"
            class="rounded-sm border-2 border-gray-400 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-java-500/50 focus:outline-hidden"
          >
            OK
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
