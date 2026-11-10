/**
 * Unit tests for rich text renderer
 */

import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { RichTextNode } from '$lib/types/booking';
import RichText from './RichText.svelte';

describe('RichText', () => {
  it('RichText_SimpleText_Expect_TextContent', () => {
    // Arrange
    const content: RichTextNode[] = [{ text: 'Hello World' }];
    // Act
    const { container } = render(RichText, { content });
    // Assert
    expect(container.textContent).toBe('Hello World');
  });

  it('RichText_NonArrayChildren_Expect_EmptyParagraph', () => {
    // Arrange
    // Pass invalid input to trigger the Array.isArray check
    const content: RichTextNode[] = [
      { type: 'paragraph', children: null as unknown as RichTextNode[] },
    ];
    // Act
    const { container } = render(RichText, { content });
    // Assert
    expect(container.querySelector('p')?.textContent).toBe('');
  });

  it('RichText_Paragraph_Expect_DefaultStyleAndText', () => {
    // Arrange
    const content: RichTextNode[] = [{ type: 'paragraph', children: [{ text: 'Hello' }] }];
    // Act
    const { container } = render(RichText, { content });
    // Assert
    expect(container.querySelector('p')?.textContent).toBe('Hello');
    expect(container.querySelector('p')?.className).toBe('mb-4');
  });

  it('RichText_Heading_Expect_DefaultHeadingStyle', () => {
    // Arrange
    const content: RichTextNode[] = [{ type: 'heading', level: 1, children: [{ text: 'H1' }] }];
    // Act
    const { container } = render(RichText, { content });
    // Assert
    expect(container.querySelector('h1')?.textContent).toBe('H1');
    expect(container.querySelector('h1')?.classList.contains('text-4xl')).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6])('RichText_HeadingLevel%s_Expect_MatchingElement', (level) => {
    // Arrange
    const content: RichTextNode[] = [{ type: 'heading', level, children: [{ text: `H${level}` }] }];
    // Act
    const { container } = render(RichText, { content });
    // Assert
    expect(container.querySelector(`h${level}`)?.textContent).toBe(`H${level}`);
  });

  it.each([
    ['bold', 'strong', 'font-bold'],
    ['italic', 'em', 'italic'],
    ['underline', 'span', 'underline'],
    ['strikethrough', 'span', 'line-through'],
    ['code', 'code', 'bg-gray-100'],
  ])('RichText_%s_Expect_FormattedText', (format, tag, className) => {
    // Arrange
    const content: RichTextNode[] = [{ text: 'Formatted', [format]: true }];
    // Act
    const { container } = render(RichText, { content });
    // Assert
    expect(container.querySelector(tag)?.textContent).toBe('Formatted');
    expect(container.querySelector(tag)?.classList.contains(className)).toBe(true);
  });

  it('RichText_EmptyCustomClass_Expect_NoClassAttribute', () => {
    // Arrange
    const content: RichTextNode[] = [{ text: 'code', code: true }];
    // Act
    const { container } = render(RichText, {
      content,
      customClasses: {
        code: '', // Remove default class
      },
    });
    // Assert
    expect(container.querySelector('code')).not.toBeNull();
    expect(container.querySelector('code')?.hasAttribute('class')).toBe(false);
  });

  it.each(['text', ''])('RichText_CombinedFormatting_Expect_NestedElements (%s)', (text) => {
    // Arrange
    const content: RichTextNode[] = [{ text, bold: true, italic: true }];
    // Act
    const { container } = render(RichText, { content });
    // Assert
    expect(container.querySelector('em > strong')?.textContent).toBe(text);
  });

  it('RichText_AllFormatting_Expect_OriginalNestingOrder', () => {
    // Arrange
    const content: RichTextNode[] = [
      {
        text: 'Formatted',
        code: true,
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true,
      },
    ];
    // Act
    const { container } = render(RichText, { content });
    // Assert
    expect(
      container.querySelector('span.line-through > span.underline > em > strong > code')
        ?.textContent,
    ).toBe('Formatted');
  });

  it('RichText_Link_Expect_UrlTextAndStyle', () => {
    // Arrange
    const content: RichTextNode[] = [
      { type: 'link', url: 'https://example.com', children: [{ text: 'Click here' }] },
    ];
    // Act
    const { container } = render(RichText, { content });
    // Assert
    const link = container.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.textContent).toBe('Click here');
    expect(link.className).toBe('text-blue-600 hover:underline');
  });

  it.each([
    ['unordered', 'ul', 'list-disc', 'Item 1', 'Item 2'],
    ['ordered', 'ol', 'list-decimal', 'First', 'Second'],
  ] as const)(
    'RichText_%sList_Expect_ListItemsAndStyle',
    (format, tag, className, first, second) => {
      // Arrange
      const content: RichTextNode[] = [
        {
          type: 'list',
          format,
          children: [
            { type: 'list-item', children: [{ text: first }] },
            { type: 'list-item', children: [{ text: second }] },
          ],
        },
      ];
      // Act
      const { container } = render(RichText, { content });
      // Assert
      expect(container.querySelector(tag)?.classList.contains(className)).toBe(true);
      expect(
        Array.from(container.querySelectorAll(`${tag} > li`), (item) => item.textContent),
      ).toEqual([first, second]);
    },
  );

  it('RichText_IndentedList_Expect_NestedListStyle', () => {
    // Arrange
    const content: RichTextNode[] = [
      {
        type: 'list',
        format: 'unordered',
        indentLevel: 1,
        children: [{ type: 'list-item', children: [{ text: 'Nested' }] }],
      },
    ];
    // Act
    const { container } = render(RichText, { content });
    // Assert
    expect(container.querySelector('ul')?.classList.contains('list-circle')).toBe(true);
    expect(container.querySelector('li')?.textContent).toBe('Nested');
  });

  it('RichText_CustomClasses_Expect_ReplacedStyle', () => {
    // Arrange
    const content: RichTextNode[] = [{ type: 'paragraph', children: [{ text: 'Custom' }] }];
    // Act
    const { container } = render(RichText, {
      content,
      customClasses: { paragraph: 'custom-paragraph-class' },
    });
    // Assert
    expect(container.querySelector('p')?.className).toBe('custom-paragraph-class');
  });

  it('RichText_ExtendedClasses_Expect_DefaultAndExtraStyle', () => {
    // Arrange
    const content: RichTextNode[] = [{ type: 'paragraph', children: [{ text: 'Text' }] }];
    // Act
    const { container } = render(RichText, {
      content,
      customClasses: { extend: { paragraph: 'extra-class' } },
    });
    // Assert
    expect(container.querySelector('p')?.classList.contains('mb-4')).toBe(true);
    expect(container.querySelector('p')?.classList.contains('extra-class')).toBe(true);
  });

  it.each([
    ['empty content', []],
    ['null node', [null as unknown as RichTextNode]],
    ['unknown leaf', [{ type: 'unknown' }]],
    // Pass non-array children to trigger !Array.isArray check
    [
      'non-array children',
      [{ type: 'unknown', children: 'not an array' as unknown as RichTextNode[] }],
    ],
    ['empty text', [{ text: '' }]],
  ] as const)('RichText_%s_Expect_EmptyContent', (_, content) => {
    // Arrange
    const props = { content: [...content] };
    // Act
    const { container } = render(RichText, props);
    // Assert
    // When children is not an array, no content is rendered
    expect(container.textContent).toBe('');
    expect(container.children).toHaveLength(0);
  });

  it('RichText_UnknownNode_Expect_NestedContent', () => {
    // Arrange
    const content: RichTextNode[] = [{ type: 'unknown', children: [{ text: 'Text' }] }];
    // Act
    const { container } = render(RichText, { content });
    // Assert
    expect(container.textContent).toBe('Text');
  });

  it('RichText_UndefinedCustomClass_Expect_DefaultStyle', () => {
    // Arrange
    const content: RichTextNode[] = [{ text: 'code text', code: true }];
    // Act
    const { container } = render(RichText, { content, customClasses: { code: undefined } });
    // Assert
    expect(container.querySelector('code')?.classList.contains('bg-gray-100')).toBe(true);
  });

  it.each([
    [{ type: 'paragraph' }, 'p'],
    [{ type: 'heading', level: 2 }, 'h2'],
    [{ type: 'list-item' }, 'li'],
    [{ type: 'link', url: 'https://example.com' }, 'a'],
    [{ type: 'list', format: 'ordered' }, 'ol'],
  ] as const)('RichText_Childless%s_Expect_EmptyElement', (node, tag) => {
    // Arrange
    const content: RichTextNode[] = [node];
    // Act
    const { container } = render(RichText, { content });
    // Assert
    expect(container.querySelector(tag)?.textContent).toBe('');
    if (tag === 'a')
      expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
  });

  describe('component replaces renderRichText convenience function', () => {
    it('RichText_DefaultProps_Expect_ParagraphContent', () => {
      // Arrange
      const content: RichTextNode[] = [{ type: 'paragraph', children: [{ text: 'Hello' }] }];
      // Act
      const { container } = render(RichText, { content });
      // Assert
      expect(container.querySelector('p')?.textContent).toBe('Hello');
      expect(container.querySelector('p')?.className).toBe('mb-4');
    });

    it('RichText_CustomProps_Expect_CustomClass', () => {
      // Arrange
      const content: RichTextNode[] = [{ type: 'paragraph', children: [{ text: 'Custom' }] }];
      // Act
      const { container } = render(RichText, { content, customClasses: { paragraph: 'custom' } });
      // Assert
      expect(container.querySelector('p')?.className).toBe('custom');
    });
  });
});
