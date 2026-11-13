/**
 * Unsaved changes detection utility
 * Migrated from Alpine.js frontend (lines 2111-2139)
 * Browser beforeunload and popstate event handlers
 */

let checkCallback: (() => boolean) | null = null;

/**
 * Register a callback to check for unsaved changes
 * The callback should return true if there are unsaved changes
 */
export function registerCheckUnsavedChanges(callback: () => boolean): void {
  checkCallback = callback;
}

/**
 * Handle unsaved changes detection
 * Shows browser confirmation dialog if there are unsaved changes
 */
function handleUnsavedChanges(event: BeforeUnloadEvent, action: string): string | undefined {
  if (checkCallback && checkCallback()) {
    const message = `Es gibt ungespeicherte Änderungen. Möchten Sie die Seite wirklich ${action}?`;
    event.returnValue = message; // Standard for most browsers
    return message; // For some older browsers
  }
}

// Initialize event listeners (only in browser context)
if (typeof window !== 'undefined') {
  // Event listener for beforeunload (page close/reload)
  window.addEventListener('beforeunload', (event) => handleUnsavedChanges(event, 'verlassen'));

  // Event listener for popstate (browser back/forward)
  window.addEventListener('popstate', (event) =>
    handleUnsavedChanges(event as unknown as BeforeUnloadEvent, 'neu laden'),
  );
}
