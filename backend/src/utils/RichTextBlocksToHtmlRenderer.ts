function updateExistingObjectKeys(
  obj: { [key: string]: any },
  newObj: { [key: string]: any }
) {
  Object.keys(obj).forEach((key) => {
    if (newObj[key]) {
      if (Array.isArray(obj[key]) && Array.isArray(newObj[key])) {
        obj[key] = newObj[key];
      } else if (obj[key] instanceof Date) {
        obj[key] = new Date(newObj[key]);
      } else if (typeof obj[key] === "string") {
        obj[key] = newObj[key].toString();
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        // if property is object, call the function recursively
        updateExistingObjectKeys(obj[key], newObj[key]);
      } else {
        obj[key] = newObj[key];
      }
    }
  });
}

function extendExistingObjectKeys(
  obj: { [key: string]: any },
  newObj: { [key: string]: any }
) {
  Object.keys(newObj).forEach((key) => {
    if (obj[key] === undefined) {
      return;
    }
    if (Array.isArray(obj[key]) && Array.isArray(newObj[key])) {
      obj[key] = obj[key].concat(newObj[key]);
    } else if (typeof obj[key] === "string") {
      obj[key] = (obj[key] + " " + newObj[key]).trim();
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      // if property is object, call the function recursively
      extendExistingObjectKeys(obj[key], newObj[key]);
    } else {
      throw new Error("Unknown key type");
    }
  });
}

interface DefaultClasses {
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
}

export class RichTextBlocksToHtmlRenderer {
  content: any[];
  defaultClasses: DefaultClasses;

  constructor(
    content: any[],
    defaultClasses: DefaultClasses & { extend?: DefaultClasses } = {}
  ) {
    this.content = content;
    this.defaultClasses = {
      heading1: "text-4xl font-bold mb-4",
      heading2: "text-3xl font-bold mb-3",
      heading3: "text-2xl font-bold mb-2",
      heading4: "text-xl font-bold mb-1",
      heading5: "text-lg font-bold mb-1",
      heading6: "text-base font-bold mb-1",
      paragraph: "mb-4",
      list: "mb-4 ml-4 list-inside",
      orderedList: "",
      orderedListLevels: [
        "list-decimal",
        "list-[lower-alpha]",
        "list-[lower-roman]",
      ],
      unorderedList: "",
      unorderedListLevels: ["list-disc", "list-circle", "list-square"],
      listItem: "mb-1",
      link: "text-blue-600 hover:underline",
      code: "bg-gray-100 rounded px-1 font-mono",
    };
    // extend defaultClasses with provided classes (overwrites existing ones)
    updateExistingObjectKeys(this.defaultClasses, defaultClasses);
    // extend defaultClasses with provided classes (adds new ones)
    extendExistingObjectKeys(this.defaultClasses, defaultClasses.extend || {});
  }

  render() {
    return this.renderNodes(this.content);
  }

  renderNodes(nodes: any[]) {
    if (!Array.isArray(nodes)) return "";
    return nodes.map((node) => this.renderNode(node)).join("");
  }

  renderNode(node: any) {
    if (!node) return "";

    // Handle text nodes with formatting
    if (node.text !== undefined) {
      return this.renderFormattedText(node);
    }

    // Handle structural nodes
    switch (node.type) {
      case "heading":
        const headingClass = this.defaultClasses[`heading${node.level}`];
        return `<h${node.level} class="${headingClass}">${this.renderNodes(node.children)}</h${node.level}>`;

      case "paragraph":
        return `<p class="${this.defaultClasses.paragraph}">${this.renderNodes(node.children)}</p>`;

      case "list":
        return this.renderList(node);

      case "list-item":
        return `<li class="${this.defaultClasses.listItem}">${this.renderNodes(node.children)}</li>`;

      case "link":
        return `<a href="${node.url}" class="${this.defaultClasses.link}">${this.renderNodes(node.children)}</a>`;

      default:
        // For any nested content that might exist
        return node.children ? this.renderNodes(node.children) : "";
    }
  }

  renderList(node: any) {
    const tag = node.format === "ordered" ? "ol" : "ul";
    const indentLevel = node.indentLevel || 0;
    const baseClass = this.defaultClasses.list;
    const listClass =
      node.format === "ordered"
        ? this.defaultClasses.orderedList +
          " " +
          this.defaultClasses.orderedListLevels[
            indentLevel % this.defaultClasses.orderedListLevels.length
          ]
        : this.defaultClasses.unorderedList +
          " " +
          this.defaultClasses.unorderedListLevels[
            indentLevel % this.defaultClasses.unorderedListLevels.length
          ];

    const classes = `${baseClass} ${listClass}`.trim();

    return `<${tag} class="${classes}">${this.renderNodes(node.children)}</${tag}>`;
  }

  renderFormattedText(node: any) {
    let content = node.text;

    // Build array of formatting operations
    const formatting = [];

    if (node.code) {
      formatting.push({
        tag: "code",
        class: this.defaultClasses.code,
      });
    }
    if (node.bold) {
      formatting.push({
        tag: "strong",
        class: "font-bold",
      });
    }
    if (node.italic) {
      formatting.push({
        tag: "em",
        class: "italic",
      });
    }
    if (node.underline) {
      formatting.push({
        tag: "span",
        class: "underline",
      });
    }
    if (node.strikethrough) {
      formatting.push({
        tag: "span",
        class: "line-through",
      });
    }

    // Apply all formatting
    formatting.forEach((format) => {
      content = `<${format.tag}${format.class ? ` class="${format.class}"` : ""}>${content}</${format.tag}>`;
    });

    return content;
  }
}
