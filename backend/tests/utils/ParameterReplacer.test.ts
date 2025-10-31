import { ParameterReplacer } from "@/utils/ParameterReplacer";

describe("ParameterReplacer", () => {
  it("replaces placeholders in strings and leaves unknown keys empty", () => {
    const template =
      "Hello {{user}}, welcome to {{city}}! Missing -> {{missing}}";
    const result = ParameterReplacer(template, {
      user: "Alex",
      city: "Munich",
    });

    expect(result).toBe("Hello Alex, welcome to Munich! Missing -> ");
  });

  it("supports callback parameters with range and arithmetic precedence", () => {
    const template =
      "Range {{range('0','42')}} and calc {{calc('2','3','4')}}";
    const parameters = {
      range: (_placeholder: string, start: string, end: string) =>
        `${start}-${end}`,
      calc: (_placeholder: string, addend: string, multiplier: string, factor: string) => {
        // Validate that multiplication happens before addition when we evaluate.
        const result =
          Number(addend) + Number(multiplier) * Number(factor);
        return String(result);
      },
    };

    const result = ParameterReplacer(template, parameters);

    expect(result).toBe("Range 0-42 and calc 14");
  });

  it("recursively processes arrays, objects, and preserves non-textual primitives", () => {
    const createdAt = new Date("2025-10-31T00:00:00.000Z");
    const retainedSymbol = Symbol("token");
    const action = () => "unchanged";

    const input = {
      simple: "{{greeting}} {{subject}}",
      nested: {
        list: ["{{first}}", { value: "{{second}}" }, 99, retainedSymbol],
        createdAt,
        action,
        truthy: true,
        big: 9007199254740991n,
      },
    };

    const output = ParameterReplacer(input, {
      greeting: "Hi",
      subject: "there",
      first: "alpha",
      second: "beta",
    });

    expect(output.simple).toBe("Hi there");
    expect(output.nested.list).toEqual([
      "alpha",
      { value: "beta" },
      99,
      retainedSymbol,
    ]);
    expect(output.nested.createdAt).toBe(createdAt);
    expect(output.nested.action).toBe(action);
    expect(output.nested.truthy).toBe(true);
    expect(output.nested.big).toBe(9007199254740991n);
  });

  it("returns nullish inputs without modification", () => {
    expect(ParameterReplacer(null, {})).toBeNull();
    expect(ParameterReplacer(undefined, {})).toBeUndefined();
  });

  it("handles empty string inputs without re-running replacements", () => {
    expect(ParameterReplacer("", { anything: "value" })).toBe("");
  });
});
