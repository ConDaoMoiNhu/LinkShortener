import { describe, it, expect } from "vitest";
import { isSlugPath } from "../middleware";

describe("proxy redirect logic", () => {
  it("handles short slug paths", () => {
    expect(isSlugPath("/abc123")).toBe(true);
  });

  it("ignores root path", () => {
    expect(isSlugPath("/")).toBe(false);
  });

  it("ignores api routes", () => {
    expect(isSlugPath("/api/links")).toBe(false);
  });

  it("ignores dashboard routes", () => {
    expect(isSlugPath("/dashboard")).toBe(false);
  });

  it("ignores login page", () => {
    expect(isSlugPath("/login")).toBe(false);
  });

  it("ignores _next paths", () => {
    expect(isSlugPath("/_next/static/chunk.js")).toBe(false);
  });

  it("ignores favicon", () => {
    expect(isSlugPath("/favicon.ico")).toBe(false);
  });
});
