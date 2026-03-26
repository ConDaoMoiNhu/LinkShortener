import { describe, it, expect } from "vitest";
import { generateSlug, isValidUrl } from "../lib/utils";

describe("generateSlug", () => {
  it("generates a slug of default length 7", () => {
    const slug = generateSlug();
    expect(slug).toHaveLength(7);
  });

  it("generates unique slugs", () => {
    const slugs = new Set(Array.from({ length: 100 }, () => generateSlug()));
    expect(slugs.size).toBe(100);
  });

  it("generates slug with only alphanumeric chars", () => {
    const slug = generateSlug();
    expect(slug).toMatch(/^[a-zA-Z0-9]+$/);
  });
});

describe("isValidUrl", () => {
  it("returns true for valid http url", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("returns true for valid https url", () => {
    expect(isValidUrl("https://example.com/path?q=1")).toBe(true);
  });

  it("returns false for invalid url", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });
});
