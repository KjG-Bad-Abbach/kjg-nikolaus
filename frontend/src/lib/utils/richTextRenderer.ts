/**
 * Rich Text Renderer utility
 * Migrated from Alpine.js frontend (lines 1969-2109)
 * Converts Strapi rich text blocks to HTML with customizable Tailwind classes
 */

import type { RichTextNode } from '$lib/types/booking';
import { extendExistingObjectKeys, updateExistingObjectKeys } from './object';

// Re-export RichTextNode type for convenience
export type { RichTextNode };

export interface RichTextClasses {
  heading1?: string;
  heading2?: string;
  heading3?: string;
  heading4?: string;
  heading5?: string;
  heading6?: string;
  paragraph?: string;
  list?: string;
  orderedList?: string;
  orderedListLevels?: string[];
  unorderedList?: string;
  unorderedListLevels?: string[];
  listItem?: string;
  link?: string;
  code?: string;
  extend?: Partial<RichTextClasses>;
}

export class RichTextBlocksRenderer {
  private content: RichTextNode[];
  private defaultClasses: Required<Omit<RichTextClasses, 'extend'>>;

  constructor(content: RichTextNode[], customClasses: RichTextClasses = {}) {
    this.content = content;
    this.defaultClasses = {
      heading1: 'text-4xl font-bold mb-4',
      heading2: 'text-3xl font-bold mb-3',
      heading3: 'text-2xl font-bold mb-2',
      heading4: 'text-xl font-bold mb-1',
      heading5: 'text-lg font-bold mb-1',
      heading6: 'text-base font-bold mb-1',
      paragraph: 'mb-4',
      list: 'mb-4 ml-4 list-inside',
      orderedList: '',
      orderedListLevels: ['list-decimal', 'list-lower-alpha', 'list-lower-roman'],
      unorderedList: '',
      unorderedListLevels: ['list-disc', 'list-circle', 'list-square'],
      listItem: 'mb-1',
      link: 'text-blue-600 hover:underline',
      code: 'bg-gray-100 rounded-sm px-1 font-mono',
    };
    // Extend defaultClasses with provided classes (overwrites existing ones)
    updateExistingObjectKeys(
      this.defaultClasses as unknown as Record<string, unknown>,
      customClasses as unknown as Record<string, unknown>,
      true,
    );
    // Extend defaultClasses with provided classes (adds new ones)
    extendExistingObjectKeys(
      this.defaultClasses as unknown as Record<string, unknown>,
      (customClasses.extend || {}) as unknown as Record<string, unknown>,
    );
  }

  render(): string {
    return this.renderNodes(this.content);
  }

  private renderNodes(nodes: RichTextNode[]): string {
    if (!Array.isArray(nodes)) return '';
    return nodes.map((node) => this.renderNode(node)).join('');
  }

  private renderNode(node: RichTextNode): string {
    if (!node) return '';

    // Handle text nodes with formatting
    if (node.text !== undefined) {
      return this.renderFormattedText(node);
    }

    // Handle structural nodes
    switch (node.type) {
      case 'heading': {
        const headingClass =
          this.defaultClasses[`heading${node.level}` as keyof typeof this.defaultClasses];
        return `<h${node.level} class="${headingClass}">${this.renderNodes(node.children || [])}</h${node.level}>`;
      }

      case 'paragraph':
        return `<p class="${this.defaultClasses.paragraph}">${this.renderNodes(node.children || [])}</p>`;

      case 'list':
        return this.renderList(node);

      case 'list-item':
        return `<li class="${this.defaultClasses.listItem}">${this.renderNodes(node.children || [])}</li>`;

      case 'link':
        return `<a href="${node.url}" class="${this.defaultClasses.link}">${this.renderNodes(node.children || [])}</a>`;

      default:
        // For any nested content that might exist
        return node.children ? this.renderNodes(node.children) : '';
    }
  }

  private renderList(node: RichTextNode): string {
    const tag = node.format === 'ordered' ? 'ol' : 'ul';
    const indentLevel = node.indentLevel || 0;
    const baseClass = this.defaultClasses.list;
    const listClass =
      node.format === 'ordered'
        ? this.defaultClasses.orderedList +
          ' ' +
          this.defaultClasses.orderedListLevels[
            indentLevel % this.defaultClasses.orderedListLevels.length
          ]
        : this.defaultClasses.unorderedList +
          ' ' +
          this.defaultClasses.unorderedListLevels[
            indentLevel % this.defaultClasses.unorderedListLevels.length
          ];

    const classes = `${baseClass} ${listClass}`.trim();

    return `<${tag} class="${classes}">${this.renderNodes(node.children || [])}</${tag}>`;
  }

  private renderFormattedText(node: RichTextNode): string {
    let content = node.text || '';

    // Build array of formatting operations
    const formatting: Array<{ tag: string; class: string }> = [];

    if (node.code) {
      formatting.push({
        tag: 'code',
        class: this.defaultClasses.code,
      });
    }
    if (node.bold) {
      formatting.push({
        tag: 'strong',
        class: 'font-bold',
      });
    }
    if (node.italic) {
      formatting.push({
        tag: 'em',
        class: 'italic',
      });
    }
    if (node.underline) {
      formatting.push({
        tag: 'span',
        class: 'underline',
      });
    }
    if (node.strikethrough) {
      formatting.push({
        tag: 'span',
        class: 'line-through',
      });
    }

    // Apply all formatting
    formatting.forEach((format) => {
      content = `<${format.tag}${format.class ? ` class="${format.class}"` : ''}>${content}</${format.tag}>`;
    });

    return content;
  }
}

/**
 * Convenience function for use in Svelte components
 */
export function renderRichText(
  content: RichTextNode[],
  customClasses: RichTextClasses = {},
): string {
  const renderer = new RichTextBlocksRenderer(content, customClasses);
  return renderer.render();
}
