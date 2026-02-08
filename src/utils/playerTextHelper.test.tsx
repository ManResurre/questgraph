// Test file with .tsx extension
import {
  extractNumber,
  parseStyleString,
  parseStyleValues,
  escapeUnknownTags,
  createReplaceOptions,
} from "./playerTextHelper";

describe("extractNumber", () => {
  test("should extract number from string", () => {
    expect(extractNumber("{123}")).toBe(123);
    expect(extractNumber("{-123.45}")).toBe(-123.45);
    expect(extractNumber("{ 123 }")).toBe(123);
    expect(extractNumber("{abc}")).toBeNull();
    expect(extractNumber("123")).toBeNull();
  });
});

describe("parseStyleString", () => {
  test("should parse style string with comma separator", () => {
    const result = parseStyleString("{color: red, font-size: 12px}");
    expect(result).toEqual({
      color: "red",
      fontSize: "12px",
    });
  });

  test("should return null for invalid inputs", () => {
    expect(parseStyleString("invalid style")).toBeNull();
  });
});

describe("parseStyleValues", () => {
  test("should parse values wrapped in curly braces", () => {
    const styleProps = {
      width: "{100}",
      height: "{200}",
    };

    const result = parseStyleValues(styleProps);
    expect(result.width).toBe(100);
    expect(result.height).toBe(200);
  });

  test("should leave normal values unchanged", () => {
    const styleProps = {
      color: "red",
      fontSize: "12px",
    };

    const result = parseStyleValues(styleProps);
    expect(result.color).toBe("red");
    expect(result.fontSize).toBe("12px");
  });
});

describe("escapeUnknownTags", () => {
  test("should escape unknown tags", () => {
    const result = escapeUnknownTags(
      "<div><custom>text</custom></div>",
      new Map(),
    );
    expect(result).toBe("<div>&lt;custom&gt;text</custom></div>");
  });

  test("should allow standard HTML tags", () => {
    const result = escapeUnknownTags(
      "<p>Hello <strong>World</strong></p>",
      new Map(),
    );
    expect(result).toBe("<p>Hello <strong>World</strong></p>");
  });
});

describe("createReplaceOptions", () => {
  test("should return object with replace function", () => {
    const result = createReplaceOptions(new Map());
    expect(result).toHaveProperty("replace");
    expect(typeof result.replace).toBe("function");
  });
});
