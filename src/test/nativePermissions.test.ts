import { describe, expect, it } from "vitest";
import capability from "../../src-tauri/capabilities/main-local.json";
import config from "../../src-tauri/tauri.conf.json";

describe("native permission scope", () => {
  it("grants only the three narrow bridge commands to the local main webview", () => {
    expect(capability.local).toBe(true);
    expect(capability.webviews).toEqual(["main"]);
    expect(capability).not.toHaveProperty("windows");
    expect(capability).not.toHaveProperty("remote");
    expect(capability.permissions).toEqual(["allow-system-summary", "allow-open-known-folder", "allow-exit-session"]);
    expect(config.app.security.capabilities).toEqual(["main-local"]);
  });
});