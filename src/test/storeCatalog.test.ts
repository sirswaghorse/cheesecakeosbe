import { describe, expect, it } from "vitest";
import { canInstallApp, filterStoreApps, isDefaultApp, storeCatalog } from "@/config/storeCatalog";

describe("store rules", () => {
  it.each(["documents", "videoplayer", "controlpanel", "pictures"])("protects default %s from installation/uninstallation controls", (id) => {
    expect(isDefaultApp(id)).toBe(true);
    expect(canInstallApp(id)).toBe(false);
  });
  it("allows optional registered apps", () => {
    expect(canInstallApp("uni-ai")).toBe(true);
    expect(isDefaultApp("uni-ai")).toBe(false);
  });
  it("does not offer unimplemented software for installation", () => {
    expect(canInstallApp("calculator")).toBe(false);
  });
  it("combines trimmed search and category filters", () => {
    expect(filterStoreApps(storeCatalog, " UNI ", "Internet").map((app) => app.id)).toEqual(["uni-ai"]);
    expect(filterStoreApps(storeCatalog, " UNI ", "Creative")).toEqual([]);
  });
});