import { describe, expect, it } from "vitest";
import { normalizePreferences } from "@/lib/systemSettings";

describe("system update preferences", () => {
  it("preserves automatic updates when enabled", () => {
    expect(normalizePreferences({ automaticUpdates: true }).automaticUpdates).toBe(true);
    expect(normalizePreferences({ automaticUpdates: false }).automaticUpdates).toBe(false);
  });
  it("supports stable and testing channels", () => {
    expect(normalizePreferences({ updateChannel: "testing" }).updateChannel).toBe("testing");
    expect(normalizePreferences({ updateChannel: "stable" }).updateChannel).toBe("stable");
  });
});