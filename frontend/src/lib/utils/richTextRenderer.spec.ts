/**
 * Unit tests for rich text renderer
 */

import { describe, expect, it } from 'vitest';
import type { RichTextNode } from '$lib/types/booking';
import { RichTextBlocksRenderer, renderRichText } from './richTextRenderer';

describe('richTextRenderer', () => {
  describe('RichTextBlocksRenderer', () => {
    it('should render simple text node', () => {
      const content: RichTextNode[] = [{ text: 'Hello World' }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toBe('Hello World');
    });

    it('should handle non-array input gracefully', () => {
      // Pass invalid input to trigger the Array.isArray check
      const renderer = new RichTextBlocksRenderer([
        { type: 'paragraph', children: null as unknown as RichTextNode[] },
      ]);
      expect(renderer.render()).toContain('<p');
    });

    it('should render paragraph', () => {
      const content: RichTextNode[] = [
        {
          type: 'paragraph',
          children: [{ text: 'Hello' }],
        },
      ];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toBe('<p class="mb-4">Hello</p>');
    });

    it('should render headings', () => {
      const renderer = new RichTextBlocksRenderer([
        { type: 'heading', level: 1, children: [{ text: 'H1' }] },
      ]);
      expect(renderer.render()).toContain('<h1');
      expect(renderer.render()).toContain('</h1>');
      expect(renderer.render()).toContain('text-4xl');
    });

    it('should render all heading levels', () => {
      for (let level = 1; level <= 6; level++) {
        const renderer = new RichTextBlocksRenderer([
          { type: 'heading', level, children: [{ text: `H${level}` }] },
        ]);
        expect(renderer.render()).toContain(`<h${level}`);
        expect(renderer.render()).toContain(`</h${level}>`);
      }
    });

    it('should render bold text', () => {
      const content: RichTextNode[] = [{ text: 'Bold', bold: true }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toBe('<strong class="font-bold">Bold</strong>');
    });

    it('should render italic text', () => {
      const content: RichTextNode[] = [{ text: 'Italic', italic: true }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toBe('<em class="italic">Italic</em>');
    });

    it('should render underlined text', () => {
      const content: RichTextNode[] = [{ text: 'Underline', underline: true }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toBe('<span class="underline">Underline</span>');
    });

    it('should render strikethrough text', () => {
      const content: RichTextNode[] = [{ text: 'Strike', strikethrough: true }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toBe('<span class="line-through">Strike</span>');
    });

    it('should render code text', () => {
      const content: RichTextNode[] = [{ text: 'code', code: true }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toContain('<code');
      expect(renderer.render()).toContain('bg-gray-100');
    });

    it('should omit class attribute if not required', () => {
      const content: RichTextNode[] = [{ text: 'code', code: true }];
      const renderer = new RichTextBlocksRenderer(content, {
        code: '', // Remove default class
      });
      expect(renderer.render()).toContain('<code');
      expect(renderer.render()).not.toContain('class=');
    });

    it('should combine multiple formatting', () => {
      const content: RichTextNode[] = [{ text: 'text', bold: true, italic: true }];
      const renderer = new RichTextBlocksRenderer(content);
      const result = renderer.render();
      expect(result).toContain('<strong');
      expect(result).toContain('<em');
    });

    it('should render links', () => {
      const content: RichTextNode[] = [
        {
          type: 'link',
          url: 'https://example.com',
          children: [{ text: 'Click here' }],
        },
      ];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toBe(
        '<a href="https://example.com" class="text-blue-600 hover:underline">Click here</a>',
      );
    });

    it('should render unordered list', () => {
      const content: RichTextNode[] = [
        {
          type: 'list',
          format: 'unordered',
          children: [
            { type: 'list-item', children: [{ text: 'Item 1' }] },
            { type: 'list-item', children: [{ text: 'Item 2' }] },
          ],
        },
      ];
      const renderer = new RichTextBlocksRenderer(content);
      const result = renderer.render();
      expect(result).toContain('<ul');
      expect(result).toContain('</ul>');
      expect(result).toContain('<li');
      expect(result).toContain('Item 1');
      expect(result).toContain('Item 2');
      expect(result).toContain('list-disc');
    });

    it('should render ordered list', () => {
      const content: RichTextNode[] = [
        {
          type: 'list',
          format: 'ordered',
          children: [
            { type: 'list-item', children: [{ text: 'First' }] },
            { type: 'list-item', children: [{ text: 'Second' }] },
          ],
        },
      ];
      const renderer = new RichTextBlocksRenderer(content);
      const result = renderer.render();
      expect(result).toContain('<ol');
      expect(result).toContain('</ol>');
      expect(result).toContain('list-decimal');
    });

    it('should handle nested lists with indent levels', () => {
      const content: RichTextNode[] = [
        {
          type: 'list',
          format: 'unordered',
          indentLevel: 1,
          children: [{ type: 'list-item', children: [{ text: 'Nested' }] }],
        },
      ];
      const renderer = new RichTextBlocksRenderer(content);
      const result = renderer.render();
      expect(result).toContain('list-circle');
    });

    it('should allow custom classes', () => {
      const content: RichTextNode[] = [{ type: 'paragraph', children: [{ text: 'Custom' }] }];
      const renderer = new RichTextBlocksRenderer(content, {
        paragraph: 'custom-paragraph-class',
      });
      expect(renderer.render()).toContain('custom-paragraph-class');
    });

    it('should extend classes with extend option', () => {
      const content: RichTextNode[] = [{ type: 'paragraph', children: [{ text: 'Text' }] }];
      const renderer = new RichTextBlocksRenderer(content, {
        extend: {
          paragraph: 'extra-class',
        },
      });
      const result = renderer.render();
      expect(result).toContain('mb-4');
      expect(result).toContain('extra-class');
    });

    it('should handle empty nodes gracefully', () => {
      const renderer = new RichTextBlocksRenderer([]);
      expect(renderer.render()).toBe('');
    });

    it('should handle null nodes', () => {
      const renderer = new RichTextBlocksRenderer([null as unknown as RichTextNode]);
      expect(renderer.render()).toBe('');
    });

    it('should handle unknown node types', () => {
      const content: RichTextNode[] = [{ type: 'unknown', children: [{ text: 'Text' }] }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toBe('Text');
    });

    it('should handle unknown node types without children', () => {
      const content: RichTextNode[] = [{ type: 'unknown' }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toBe('');
    });

    it('should handle unknown node type with non-array children', () => {
      // Pass non-array children to trigger !Array.isArray check
      const content: RichTextNode[] = [
        { type: 'unknown', children: 'not an array' as unknown as RichTextNode[] },
      ];
      const renderer = new RichTextBlocksRenderer(content);
      // When children is not an array, renderNodes returns empty string
      expect(renderer.render()).toBe('');
    });

    it('should handle text nodes with empty text', () => {
      const content: RichTextNode[] = [{ text: '' }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toBe('');
    });

    it('should handle multiple formatting on empty text', () => {
      const content: RichTextNode[] = [{ text: '', bold: true, italic: true }];
      const renderer = new RichTextBlocksRenderer(content);
      const result = renderer.render();
      expect(result).toContain('<strong');
      expect(result).toContain('<em');
    });

    it('should render formatting with default class when custom class is undefined', () => {
      const content: RichTextNode[] = [{ text: 'code text', code: true }];
      const renderer = new RichTextBlocksRenderer(content, {
        code: undefined,
      });
      const result = renderer.render();
      expect(result).toContain('<code class=');
      expect(result).toContain('bg-gray-100');
    });

    it('should handle paragraph without children', () => {
      const content: RichTextNode[] = [{ type: 'paragraph' }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toContain('<p');
    });

    it('should handle heading without children', () => {
      const content: RichTextNode[] = [{ type: 'heading', level: 2 }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toContain('<h2');
    });

    it('should handle list-item without children', () => {
      const content: RichTextNode[] = [{ type: 'list-item' }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toContain('<li');
    });

    it('should handle link without children', () => {
      const content: RichTextNode[] = [{ type: 'link', url: 'https://example.com' }];
      const renderer = new RichTextBlocksRenderer(content);
      const result = renderer.render();
      expect(result).toContain('href="https://example.com"');
    });

    it('should handle list without children', () => {
      const content: RichTextNode[] = [{ type: 'list', format: 'ordered' }];
      const renderer = new RichTextBlocksRenderer(content);
      expect(renderer.render()).toContain('<ol');
    });
  });

  describe('renderRichText convenience function', () => {
    it('should render content using convenience function', () => {
      const content: RichTextNode[] = [{ type: 'paragraph', children: [{ text: 'Hello' }] }];
      const result = renderRichText(content);
      expect(result).toBe('<p class="mb-4">Hello</p>');
    });

    it('should accept custom classes', () => {
      const content: RichTextNode[] = [{ type: 'paragraph', children: [{ text: 'Custom' }] }];
      const result = renderRichText(content, { paragraph: 'custom' });
      expect(result).toContain('custom');
    });
  });
});
