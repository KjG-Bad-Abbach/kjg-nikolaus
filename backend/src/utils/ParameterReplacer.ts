function replaceInString(
  input: string,
  parameters: { [key: string]: string | Function }
): string {
  Object.keys(parameters || {}).forEach((key) => {
    const keyRegex = new RegExp(
      `{{${key}(?:\\((?:'(?<param>[^']*)'(?:,\\s*)?)*\\))?}}`,
      "g"
    );
    const paramRegex = /'([^']*)'/g;

    input = (input || "").replace(keyRegex, (placeholder) => {
      let replacement = parameters[key];

      if (typeof replacement === "function") {
        const params = [];
        for (const match of placeholder.matchAll(paramRegex)) {
          params.push(match[1]);
        }
        replacement = replacement(placeholder, ...params);
      }

      return replacement as string;
    });
  });

  return input;
}

function replaceInAny(
  input: any,
  parameters: { [key: string]: string | Function }
): any {
  if (input === null || input === undefined) {
    return input;
  } else if (Array.isArray(input)) {
    return input.map((x) => replaceInAny(x, parameters));
  } else if (
    input instanceof Date ||
    typeof input === "boolean" ||
    typeof input === "number" ||
    typeof input === "bigint" ||
    typeof input === "function" ||
    typeof input === "symbol"
  ) {
    return input;
  } else if (typeof input === "string") {
    return replaceInString(`${input}`, parameters);
  } else if (typeof input === "object" && input !== null) {
    return Object.keys(input).reduce((acc, key) => {
      acc[key] = replaceInAny(input[key], parameters);
      return acc;
    }, {});
  }
  return replaceInString(`${input}`, parameters);
}

export function ParameterReplacer(
  input: any,
  parameters: { [key: string]: string | Function }
): any {
  return replaceInAny(input, parameters);
}
