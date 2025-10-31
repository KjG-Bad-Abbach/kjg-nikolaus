type Options = { escape?: "lacy" | "strict" };

export class RichTextBlocksToMarkdownRenderer {
  content: any[];
  unorderedListLevels = ["-", "*", "+"] as ["-", "*", "+"];
  options: Options;

  constructor(content: any[], options?: Options) {
    this.content = content;
    this.options = options;
  }

  render() {
    return this.renderNodes(this.content);
  }

  renderNodes(nodes: any[], indentLevel?: number, listFormat?: string) {
    if (!Array.isArray(nodes)) return "";
    return nodes
      .map((node, index) =>
        this.renderNode(node, indentLevel, listFormat, index)
      )
      .join("");
  }

  renderNode(
    node: any,
    indentLevel?: number,
    listFormat?: string,
    index?: number
  ) {
    if (!node) return "";

    // Handle text nodes with formatting
    if (node.text !== undefined) {
      return this.renderFormattedText(node);
    }

    // Handle structural nodes
    switch (node.type) {
      case "heading":
        return (
          "\r\n" +
          "#".repeat(node.level) +
          " " +
          this.renderNodes(node.children) +
          "\r\n"
        );

      case "paragraph":
        return "\r\n" + this.renderNodes(node.children) + "\r\n";

      case "list":
        return "\r\n" + this.renderList(node) + "\r\n";

      case "list-item":
        const itemPrefix =
          listFormat === "ordered"
            ? `${index + 1}. `
            : this.unorderedListLevels[
                (indentLevel || 0) % this.unorderedListLevels.length
              ] + " ";
        return `${"    ".repeat(indentLevel || 0)}${itemPrefix}${this.renderNodes(node.children)}\r\n`;

      case "link":
        return `[${this.renderNodes(node.children)}](${node.url})`;

      default:
        // For any nested content that might exist
        return node.children ? this.renderNodes(node.children) : "";
    }
  }

  renderList(node: any) {
    const indentLevel = node.indentLevel || 0;
    const listFormat = node.format;
    return this.renderNodes(node.children, indentLevel, listFormat);
  }

  renderFormattedText(node: any) {
    let content = this.escapeText(node.text);

    // Apply markdown formatting
    if (node.code) {
      content = `\`${content}\``;
    }
    if (node.bold) {
      content = `**${content}**`;
    }
    if (node.italic) {
      content = `*${content}*`;
    }
    if (node.underline) {
      // Markdown does not support underline directly, so we'll use HTML
      content = `<u>${content}</u>`;
    }
    if (node.strikethrough) {
      // Markdown does not support strikethrough directly, so we'll use HTML
      content = `<s>${content}</s>`;
    }

    return content;
  }

  escapeText(input: string): string {
    if (this.options?.escape === "lacy") {
      // escape code char: `
      return input.replace(/[`]/g, (m) => `\\${m}`);
    } else {
      // escape special markdown chars: \`*_{}[]<>()#+-.!|
      return input.replace(
        /[\\`\*_\{\}\[\]\<\>\(\)#\+\-\.!\|]/g,
        (m) => `\\${m}`
      );
    }
  }
}
