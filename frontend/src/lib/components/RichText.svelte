<script lang="ts">
  import type { RichTextNode } from '$lib/types/booking';
  import {
    getRichTextClasses,
    getSafeRichTextUrl,
    type RichTextClasses,
  } from '$lib/utils/richText';

  const {
    content,
    customClasses = {},
  }: {
    content: RichTextNode[];
    customClasses?: RichTextClasses;
  } = $props();

  const classes = $derived(getRichTextClasses(customClasses));

  function getHeadingTag(level: number | undefined): `h${1 | 2 | 3 | 4 | 5 | 6}` | undefined {
    return typeof level === 'number' && Number.isInteger(level) && level >= 1 && level <= 6
      ? (`h${level}` as `h${1 | 2 | 3 | 4 | 5 | 6}`)
      : undefined;
  }

  function getListClasses(node: RichTextNode): string {
    const levels =
      node.format === 'ordered' ? classes.orderedListLevels : classes.unorderedListLevels;
    const listClass = node.format === 'ordered' ? classes.orderedList : classes.unorderedList;
    return `${classes.list} ${listClass} ${levels[(node.indentLevel || 0) % levels.length]}`.trim();
  }

  function getTextFormats(node: RichTextNode): Array<{ tag: string; class: string }> {
    // Build array of formatting operations
    return [
      { enabled: node.strikethrough, tag: 'span', class: 'line-through' },
      { enabled: node.underline, tag: 'span', class: 'underline' },
      { enabled: node.italic, tag: 'em', class: 'italic' },
      { enabled: node.bold, tag: 'strong', class: 'font-bold' },
      { enabled: node.code, tag: 'code', class: classes.code },
    ].filter((format) => format.enabled);
  }
</script>

{#snippet formattedText(
  text: string,
  formats: Array<{ tag: string; class: string }>,
  index: number,
)}
  <!-- Apply all formatting -->
  {#if index < formats.length}
    <svelte:element this={formats[index].tag} class={formats[index].class || undefined}>
      {@render formattedText(text, formats, index + 1)}
    </svelte:element>
  {:else}
    {text}
  {/if}
{/snippet}

{#snippet nodes(items: RichTextNode[] | undefined)}
  {#if Array.isArray(items)}
    {#each items as node, index (index)}
      {#if node}
        <!-- Handle text nodes with formatting -->
        {#if node.text !== undefined}
          {@render formattedText(node.text, getTextFormats(node), 0)}
        {:else if node.type === 'heading'}
          {@const tag = getHeadingTag(node.level)}
          {#if tag}
            <svelte:element
              this={tag}
              class={classes[`heading${node.level}` as keyof typeof classes]}
            >
              {@render nodes(node.children)}
            </svelte:element>
          {:else}
            {@render nodes(node.children)}
          {/if}
        {:else if node.type === 'paragraph'}
          <p class={classes.paragraph}>{@render nodes(node.children)}</p>
        {:else if node.type === 'list'}
          <svelte:element
            this={node.format === 'ordered' ? 'ol' : 'ul'}
            class={getListClasses(node)}
          >
            {@render nodes(node.children)}
          </svelte:element>
        {:else if node.type === 'list-item'}
          <li class={classes.listItem}>{@render nodes(node.children)}</li>
        {:else if node.type === 'link'}
          {@const href = getSafeRichTextUrl(node.url)}
          {#if href}
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- CMS URLs are protocol-validated destinations, not application route IDs. -->
            <a {href} class={classes.link}>{@render nodes(node.children)}</a>
          {:else}
            {@render nodes(node.children)}
          {/if}
        {:else}
          <!-- For any nested content that might exist -->
          {@render nodes(node.children)}
        {/if}
      {/if}
    {/each}
  {/if}
{/snippet}

{@render nodes(content)}
