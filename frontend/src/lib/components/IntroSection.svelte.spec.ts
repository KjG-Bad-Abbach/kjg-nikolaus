import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import IntroSection from './IntroSection.svelte';
import type { RichTextNode } from '$lib/utils/richTextRenderer';

describe('IntroSection', () => {
  const sampleIntroText: RichTextNode[] = [
    {
      type: 'heading',
      level: 2,
      children: [{ type: 'text', text: 'Willkommen' }],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text: 'Dies ist ein Test für die Einführung.',
        },
      ],
    },
  ];

  it('should render introduction text', async () => {
    render(IntroSection, {
      introductionText: sampleIntroText,
      onStart: vi.fn(),
    });

    await expect.element(page.getByText('Willkommen')).toBeInTheDocument();
    await expect
      .element(page.getByText('Dies ist ein Test für die Einführung.'))
      .toBeInTheDocument();
  });

  it('should render start button with correct text', async () => {
    render(IntroSection, {
      introductionText: sampleIntroText,
      onStart: vi.fn(),
    });

    const button = page.getByTestId('qa-intro-start');
    await expect.element(button).toBeInTheDocument();
    await expect.element(button).toHaveTextContent('Jetzt anmelden');
  });

  it('should call onStart when button is clicked', async () => {
    const onStart = vi.fn();
    render(IntroSection, {
      introductionText: sampleIntroText,
      onStart,
    });

    const button = page.getByTestId('qa-intro-start');
    await button.click();

    expect(onStart).toHaveBeenCalledOnce();
  });

  it('should have correct test id on container', async () => {
    const { container } = render(IntroSection, {
      introductionText: sampleIntroText,
      onStart: vi.fn(),
    });

    const introDiv = container.querySelector('[data-testid="qa-view-intro"]');
    expect(introDiv).toBeTruthy();
  });

  it('should render empty introduction text gracefully', async () => {
    render(IntroSection, {
      introductionText: [],
      onStart: vi.fn(),
    });

    const button = page.getByTestId('qa-intro-start');
    await expect.element(button).toBeInTheDocument();
  });

  it('should apply custom classes to headings via rich text renderer', async () => {
    const introWithHeadings: RichTextNode[] = [
      {
        type: 'heading',
        level: 1,
        children: [{ type: 'text', text: 'Heading 1' }],
      },
    ];

    const { container } = render(IntroSection, {
      introductionText: introWithHeadings,
      onStart: vi.fn(),
    });

    const heading = container.querySelector('h1');
    expect(heading).toBeTruthy();
    expect(heading?.classList.contains('text-calypso')).toBe(true);
  });

  it('should apply custom classes to links via rich text renderer', async () => {
    const introWithLink: RichTextNode[] = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ type: 'text', text: 'Example Link' }],
          },
        ],
      },
    ];

    const { container } = render(IntroSection, {
      introductionText: introWithLink,
      onStart: vi.fn(),
    });

    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.classList.contains('text-atlantis')).toBe(true);
    expect(link?.classList.contains('hover:text-surfie-green')).toBe(true);
  });

  it('should have correct styling classes on container', async () => {
    const { container } = render(IntroSection, {
      introductionText: sampleIntroText,
      onStart: vi.fn(),
    });

    const introDiv = container.querySelector('[data-testid="qa-view-intro"]');
    expect(introDiv?.classList.contains('bg-white')).toBe(true);
    expect(introDiv?.classList.contains('shadow-md')).toBe(true);
    expect(introDiv?.classList.contains('rounded-lg')).toBe(true);
    expect(introDiv?.classList.contains('p-6')).toBe(true);
  });

  it('should have correct styling classes on button', async () => {
    const { container } = render(IntroSection, {
      introductionText: sampleIntroText,
      onStart: vi.fn(),
    });

    const button = container.querySelector('[data-testid="qa-intro-start"]');
    expect(button?.classList.contains('bg-atlantis')).toBe(true);
    expect(button?.classList.contains('hover:bg-surfie-green')).toBe(true);
    expect(button?.classList.contains('text-white')).toBe(true);
    expect(button?.classList.contains('font-bold')).toBe(true);
  });

  it('should render complex nested structures', async () => {
    const complexIntro: RichTextNode[] = [
      {
        type: 'list',
        format: 'ordered',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'text', text: 'First item' }],
          },
          {
            type: 'list-item',
            children: [{ type: 'text', text: 'Second item' }],
          },
        ],
      },
    ];

    const { container } = render(IntroSection, {
      introductionText: complexIntro,
      onStart: vi.fn(),
    });

    const list = container.querySelector('ol');
    expect(list).toBeTruthy();
  });

  it('should handle text with bold formatting', async () => {
    const boldIntro: RichTextNode[] = [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'This is ' },
          { type: 'text', text: 'bold', bold: true },
        ],
      },
    ];

    const { container } = render(IntroSection, {
      introductionText: boldIntro,
      onStart: vi.fn(),
    });

    const strong = container.querySelector('strong');
    expect(strong).toBeTruthy();
    expect(strong?.textContent).toBe('bold');
  });

  it('should handle text with italic formatting', async () => {
    const italicIntro: RichTextNode[] = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'italic text', italic: true }],
      },
    ];

    const { container } = render(IntroSection, {
      introductionText: italicIntro,
      onStart: vi.fn(),
    });

    const em = container.querySelector('em');
    expect(em).toBeTruthy();
    expect(em?.textContent).toBe('italic text');
  });

  it('should render multiple paragraphs correctly', async () => {
    const multiParagraph: RichTextNode[] = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'First paragraph' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Second paragraph' }],
      },
    ];

    render(IntroSection, {
      introductionText: multiParagraph,
      onStart: vi.fn(),
    });

    await expect.element(page.getByText('First paragraph')).toBeInTheDocument();
    await expect.element(page.getByText('Second paragraph')).toBeInTheDocument();
  });

  it('should reactively update when introductionText changes', async () => {
    const initialText: RichTextNode[] = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Initial text' }],
      },
    ];

    const { rerender } = render(IntroSection, {
      introductionText: initialText,
      onStart: vi.fn(),
    });

    await expect.element(page.getByText('Initial text')).toBeInTheDocument();

    const updatedText: RichTextNode[] = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Updated text' }],
      },
    ];

    rerender({ introductionText: updatedText, onStart: vi.fn() });

    await expect.element(page.getByText('Updated text')).toBeInTheDocument();
  });
});
