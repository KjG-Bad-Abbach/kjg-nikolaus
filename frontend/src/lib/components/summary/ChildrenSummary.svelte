<script lang="ts">
  import SummaryCard from './SummaryCard.svelte';
  import type { Child } from '$lib/types/booking';
  import { isFilled } from '$lib/utils/string';
  import { formatDateTime } from '$lib/utils/dateFormat';

  /**
   * Children summary card
   * Displays list of children with their details and additional notes
   */
  let {
    children,
    additionalNotes,
    finalDeadline,
    onEdit,
  }: {
    /** Array of children */
    children: Child[];
    /** Additional notes for Nikolaus */
    additionalNotes: string;
    /** Final deadline */
    finalDeadline: Date;
    /** Callback when edit button is clicked */
    onEdit: () => void;
  } = $props();

  const deadlineText = $derived(formatDateTime(finalDeadline));
</script>

<SummaryCard title="Kinder" {onEdit}>
  <ul class="space-y-2">
    {#each children as child, index (index)}
      <li class="flex flex-col text-gray-700">
        <div>
          <div class="flex flex-wrap items-baseline gap-1">
            Name: <span>{child.name}</span>{#if !isFilled(child.name)}<span
                class="text-rust italic"
              >
                (Angabe fehlt, Deadline:
                <span>{deadlineText}</span>)</span
              >{/if}
          </div>
        </div>
        <div>
          <div class="flex flex-wrap items-baseline gap-1">
            Merkmal: <span>{child.identification_trait}</span
            >{#if !isFilled(child.identification_trait)}<span class="text-rust italic">
                (Angabe fehlt, Deadline:
                <span>{deadlineText}</span>)</span
              >{/if}
          </div>
        </div>
        <div>
          <div class="flex flex-wrap items-baseline gap-1">
            <span>Rede:</span>
            <div class="min-w-0 flex-1">
              <div class="truncate">{child.speech}</div>
            </div>
          </div>
          {#if !isFilled(child.speech)}
            <span class="text-rust italic">
              (Angabe fehlt, Deadline:
              <span>{deadlineText}</span>)
            </span>
          {/if}
        </div>
      </li>
    {/each}
    {#if children.length <= 0}
      <li class="text-rust italic">
        (Angabe fehlt, Deadline:
        <span>{deadlineText}</span>)
      </li>
    {/if}
  </ul>
  {#if isFilled(additionalNotes)}
    <div class="mt-2 flex flex-wrap items-baseline gap-1 text-gray-700">
      <span>Hinweise für den Nikolaus:</span>
      <div class="min-w-0 flex-1">
        <div class="truncate">{additionalNotes}</div>
      </div>
    </div>
  {/if}
</SummaryCard>
