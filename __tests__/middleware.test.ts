import { describe, it, expect } from "vitest";

// Unit test logic extract từ middleware
function shouldHandleRedirect(pathname: string): boolean {
  const excluded = ["/api", "/dashboard", "/login", "/_next", "/favicon.ico"];
  return (
    pathname !== "/" &&
    !excluded.some((p) => pathname.startsWith(p)) &&
    pathname.length > 1
  );
}

describe("middleware redirect logic", () => {
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
});
