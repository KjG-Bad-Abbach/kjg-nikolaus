import { RichTextBlocksToMarkdownRenderer } from "@/utils/RichTextBlocksToMarkdownRenderer";

describe("RichTextBlocksToMarkdownRenderer", () => {
  it("renders headings, paragraphs, nested lists, and links", () => {
    const renderer = new RichTextBlocksToMarkdownRenderer([
      null as any,
      {
        type: "heading",
        level: 2,
        children: [{ text: "Introduction" }],
      },
      {
        type: "paragraph",
        children: [
          { text: "Bold", bold: true },
          { text: " " },
          { text: "italic", italic: true },
          { text: " " },
          {
            type: "link",
            url: "https://example.com",
            children: [{ text: "Example" }],
          },
        ],
      },
      {
        type: "list",
        format: "ordered",
        indentLevel: 2,
        children: [
          {
            type: "list-item",
            children: [{ text: "First item" }],
          },
          {
            type: "list-item",
            children: [
              {
                type: "list",
                format: "unordered",
                indentLevel: 3,
                children: [
                  {
                    type: "list-item",
                    children: [
                      {
                        text: "Decorated",
                        underline: true,
                        strikethrough: true,
                        code: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "custom",
        children: [{ text: "Custom node" }],
      },
      {
        type: "list",
        format: "unordered",
        children: [
          {
            type: "list-item",
            children: [{ text: "Zero indent unordered" }],
          },
          {
            type: "list-item",
            children: [],
          },
        ],
      },
      { type: "custom-empty" },
    ]);

    const markdown = renderer.render();

    expect(markdown).toContain("## Introduction");
    expect(markdown).toContain("**Bold**");
    expect(markdown).toContain("*italic*");
    expect(markdown).toContain("[Example](https://example.com)");
    expect(markdown).toMatch(/1\. First item/);
    expect(markdown).toMatch(/2\. \r\n/);
    expect(markdown).toContain("Decorated");
    expect(markdown).toContain("Custom node");
    expect(markdown).toContain("- Zero indent unordered");
    expect(markdown).not.toContain("custom-empty");
    expect(renderer.renderNodes("not-array" as any)).toBe("");
  });

  it("escapes markdown characters according to the configured strategy", () => {
    const strictRenderer = new RichTextBlocksToMarkdownRenderer([
      {
        type: "paragraph",
        children: [
          {
            text: "Special chars: \\`*_{}[]<>()#+-.!|",
          },
        ],
      },
    ]);

    const strictMarkdown = strictRenderer.render();
    const expectedSpecials = [
      "\\\\",
      "\\`",
      "\\*",
      "\\_",
      "\\{",
      "\\}",
      "\\[",
      "\\]",
      "\\<",
      "\\>",
      "\\(",
      "\\)",
      "\\#",
      "\\+",
      "\\-",
      "\\.",
      "\\!",
      "\\|",
    ];
    for (const special of expectedSpecials) {
      expect(strictMarkdown).toContain(special);
    }

    const lacyRenderer = new RichTextBlocksToMarkdownRenderer(
      [
        {
          type: "paragraph",
          children: [
            {
              text: "Only backticks ` need escaping *not stars*",
            },
          ],
        },
      ],
      { escape: "lacy" }
    );

    const lacyMarkdown = lacyRenderer.render();
    expect(lacyMarkdown).toContain("Only backticks \\` need escaping *not stars*");
    expect(lacyMarkdown).not.toContain("\\*");
  });
});
