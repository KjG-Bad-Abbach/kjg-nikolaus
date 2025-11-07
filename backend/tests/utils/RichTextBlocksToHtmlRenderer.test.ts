import {
  RichTextBlocksToHtmlRenderer,
  extendExistingObjectKeys,
  updateExistingObjectKeys,
} from "@/utils/RichTextBlocksToHtmlRenderer";

describe("RichTextBlocksToHtmlRenderer", () => {
  it("renders structural nodes with formatting and class overrides", () => {
    const renderer = new RichTextBlocksToHtmlRenderer(
      [
        {
          type: "heading",
          level: 2,
          children: [{ text: "Overview" }],
        },
        {
          type: "paragraph",
          children: [
            {
              text: "inline",
              code: true,
              bold: true,
              italic: true,
              underline: true,
              strikethrough: true,
            },
          ],
        },
        {
          type: "list",
          format: "ordered",
          indentLevel: 4,
          children: [
            {
              type: "list-item",
              children: [{ text: "first" }],
            },
          ],
        },
        {
          type: "list",
          format: "unordered",
          indentLevel: 3,
          children: [
            {
              type: "list-item",
              children: [{ text: "second" }],
            },
          ],
        },
        {
          type: "link",
          url: "https://example.com",
          children: [{ text: "Docs" }],
        },
        {
          type: "list",
          format: "ordered",
          children: [null],
        },
        {
          type: "unknown",
          children: [{ text: "fallback" }],
        },
        {
          type: "unhandled",
        },
      ],
      {
        heading2: "custom-heading",
        paragraph: "custom-p",
      }
    );

    const html = renderer.render();

    expect(html).toContain(
      '<h2 class="custom-heading">Overview</h2>'
    );
    expect(html).toContain(
      '<p class="custom-p"><span class="line-through"><span class="underline"><em class="italic"><strong class="font-bold"><code class="bg-gray-100 rounded-sm px-1 font-mono">inline</code></strong></em></span></span></p>'
    );
    expect(html).toContain(
      '<ol class="mb-4 ml-4 list-inside  list-lower-alpha"><li class="mb-1">first</li></ol>'
    );
    expect(html).toContain(
      '<ul class="mb-4 ml-4 list-inside  list-disc"><li class="mb-1">second</li></ul>'
    );
    expect(html).toContain(
      '<a href="https://example.com" class="text-blue-600 hover:underline">Docs</a>'
    );
    expect(html).toContain("fallback");
    expect(html).toContain("<ol");
    expect(html).not.toContain("null");
  });

  it("extends classes without dropping defaults and handles non-array input gracefully", () => {
    const renderer = new RichTextBlocksToHtmlRenderer([], {
      extend: {
        paragraph: "extra-spacing",
        unorderedListLevels: ["list-diamond"],
      },
    });

    const paragraphHtml = new RichTextBlocksToHtmlRenderer(
      [
        {
          type: "paragraph",
          children: [{ text: "Body" }],
        },
        {
          type: "list",
          format: "unordered",
          indentLevel: 7,
          children: [
            {
              type: "list-item",
              children: [{ text: "Indented" }],
            },
          ],
        },
      ],
      {
        extend: {
          paragraph: "extra-spacing",
          unorderedListLevels: ["list-diamond"],
        },
      }
    ).render();

    expect(renderer.renderNodes("not-an-array" as any)).toBe("");
    expect(paragraphHtml).toContain('class="mb-4 extra-spacing"');
    expect(paragraphHtml).toContain(
      '<ul class="mb-4 ml-4 list-inside  list-diamond">'
    );
  });

  it("allows overriding ordered list level classes", () => {
    const renderer = new RichTextBlocksToHtmlRenderer(
      [
        {
          type: "list",
          format: "ordered",
          indentLevel: 1,
          children: [
            {
              type: "list-item",
              children: [{ text: "Item" }],
            },
          ],
        },
      ],
      {
        orderedListLevels: ["lvl-one", "lvl-two"],
      }
    );

    const html = renderer.render();
    expect(html).toContain(
      '<ol class="mb-4 ml-4 list-inside  lvl-two"><li class="mb-1">Item</li></ol>'
    );
  });

  it("supports format tags without classes", () => {
    const renderer = new RichTextBlocksToHtmlRenderer([
      {
        type: "paragraph",
        children: [
          {
            text: "snippet",
            code: true,
            bold: true,
          },
        ],
      },
    ]);
    renderer.defaultClasses.code = undefined;

    const html = renderer.render();
    expect(html).toContain("<code>snippet</code>");
    expect(html).toContain('<strong class="font-bold">');
  });
});

describe("RichTextBlocksToHtmlRenderer helpers", () => {
  it("updates existing keys across arrays, dates, strings, objects, and primitives", () => {
    const target = {
      array: ["a"],
      date: new Date("2024-01-01T00:00:00.000Z"),
      text: "legacy",
      nested: { child: "before" },
      flag: 1,
    };
    const source = {
      array: ["b"],
      date: "2025-02-02T03:04:05.000Z",
      text: 99,
      nested: { child: "after" },
      flag: 2,
    };

    updateExistingObjectKeys(target, source);

    expect(target.array).toEqual(["b"]);
    expect(target.date).toBeInstanceOf(Date);
    expect(target.date.toISOString()).toBe("2025-02-02T03:04:05.000Z");
    expect(target.text).toBe("99");
    expect(target.nested.child).toBe("after");
    expect(target.flag).toBe(2);
  });

  it("extends keys recursively while ignoring unknown keys and throws for unsupported types", () => {
    const target = {
      array: [1],
      text: "base",
      nested: { items: ["x"] },
      unsupported: 0,
    };
    const source = {
      array: [2],
      text: "extra",
      nested: { items: ["y"] },
      ignored: "value",
    };

    extendExistingObjectKeys(target as any, source as any);

    expect(target.array).toEqual([1, 2]);
    expect(target.text).toBe("base extra");
    expect(target.nested.items).toEqual(["x", "y"]);
    expect(target).not.toHaveProperty("ignored");

    expect(() =>
      extendExistingObjectKeys(target as any, { unsupported: 1 } as any)
    ).toThrow("Unknown key type");
  });
});
