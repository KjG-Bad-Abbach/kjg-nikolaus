<script lang="ts">
  import { formatDateTime } from '$lib/utils/dateFormat';

  /**
   * DeadlineBanner Component
   *
   * Displays important booking deadlines with visual indicators:
   * - Route planning deadline (for address and time slots)
   * - Final deadline (for all other details)
   * - Applies strikethrough styling when deadlines have passed
   */

  export type Props = {
    routePlanningDeadline: Date;
    finalDeadline: Date;
    canEditRoutePlanning: boolean;
    canEditAnything: boolean;
  };

  const { routePlanningDeadline, finalDeadline, canEditRoutePlanning, canEditAnything }: Props =
    $props();
</script>

<div class="mx-2 mt-4 text-calypso" data-testid="qa-deadlines">
  <p class="font-bold">Wichtige Termine:</p>
  <p
    class:line-through={!canEditRoutePlanning}
    class:text-calypso-700={!canEditRoutePlanning}
    data-testid="qa-deadline-route-planning"
  >
    Adresse und Zeitslots:
    <span class="font-semibold">{formatDateTime(routePlanningDeadline)}</span>
    <span class="text-sm">(wichtig für Routenplanung)</span>
  </p>
  <p
    class:line-through={!canEditAnything}
    class:text-calypso-700={!canEditAnything}
    data-testid="qa-deadline-final"
  >
    Finale Deadline:
    <span class="font-semibold">{formatDateTime(finalDeadline)}</span>
    <span class="text-sm">(für alle restlichen Angaben)</span>
  </p>
</div>
