import { describe, it, expect } from "vitest";
import { shouldHandleRedirect } from "../proxy";

describe("proxy redirect logic", () => {
  it("handles short slug paths", () => {
    expect(shouldHandleRedirect("/abc123")).toBe(true);
  });

  it("ignores root path", () => {
    expect(shouldHandleRedirect("/")).toBe(false);
  });

  it("ignores api routes", () => {
    expect(shouldHandleRedirect("/api/links")).toBe(false);
  });

  it("ignores dashboard routes", () => {
    expect(shouldHandleRedirect("/dashboard")).toBe(false);
  });

  it("ignores login page", () => {
    expect(shouldHandleRedirect("/login")).toBe(false);
  });

  it("ignores _next paths", () => {
    expect(shouldHandleRedirect("/_next/static/chunk.js")).toBe(false);
  });

  it("ignores favicon", () => {
    expect(shouldHandleRedirect("/favicon.ico")).toBe(false);
  });
});
