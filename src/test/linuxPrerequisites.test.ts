import { describe, expect, it } from "vitest";
// Build-only utilities run as Node modules, independently of the browser bundle.
// @ts-expect-error The intentionally plain-JavaScript build utility has no declarations.
import { rustIsSupported } from "../../scripts/linux-prerequisites.mjs";

describe("locked Tauri compiler requirement", () => {
  it("requires Rust 1.90 or newer", () => {
    expect(rustIsSupported("rustc 1.89.0 (test)")).toBe(false);
    expect(rustIsSupported("rustc 1.90.0 (test)")).toBe(true);
    expect(rustIsSupported("rustc 1.91.1 (test)")).toBe(true);
    expect(rustIsSupported("rustc 2.0.0 (test)")).toBe(true);
    expect(rustIsSupported("not installed")).toBe(false);
  });
});