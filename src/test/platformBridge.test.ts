import { describe, expect, it, vi } from "vitest";
import type { invoke } from "@tauri-apps/api/core";
import { createPlatformBridge, KNOWN_FOLDERS, type KnownFolder } from "@/lib/platformBridge";

describe("Linux bridge boundaries", () => {
  it("keeps the browser desktop independent of native IPC", async () => {
    const call = vi.fn();
    const bridge = createPlatformBridge(false, call as typeof invoke);
    expect(bridge.environment).toBe("browser");
    expect(await bridge.getSystemSummary()).toBeNull();
    await expect(bridge.openFolder("documents")).rejects.toThrow("Linux desktop only");
    expect(await bridge.exitSession()).toBe(false);
    expect(call).not.toHaveBeenCalled();
  });

  it("opens Documents through the fixed native folder command", async () => {
    const call = vi.fn().mockResolvedValue(undefined);
    await createPlatformBridge(true, call as typeof invoke).openFolder("documents");
    expect(call).toHaveBeenCalledExactlyOnceWith("open_known_folder", { folder: "documents" });
  });

  it("rejects paths and shell text before IPC", async () => {
    const call = vi.fn();
    const bridge = createPlatformBridge(true, call as typeof invoke);
    for (const folder of ["/etc", "../Documents", "documents; shutdown", "terminal"]) {
      await expect(bridge.openFolder(folder as KnownFolder)).rejects.toThrow("Unsupported folder");
    }
    expect(call).not.toHaveBeenCalled();
    expect(KNOWN_FOLDERS).toEqual(["documents", "pictures", "music", "videos", "downloads"]);
  });

  it("reads real system values without substituting browser mock data", async () => {
    const summary = { os: "Linux", osVersion: "test", kernel: "6.8", hostname: "blueberry", totalMemory: 8589934592, usedMemory: 2147483648 };
    const call = vi.fn().mockResolvedValue(summary);
    const bridge = createPlatformBridge(true, call as typeof invoke);
    expect(await bridge.getSystemSummary()).toEqual(summary);
    expect(call).toHaveBeenCalledExactlyOnceWith("system_summary");
  });

  it("propagates native failures instead of reporting success", async () => {
    const call = vi.fn().mockRejectedValue(new Error("native unavailable"));
    const bridge = createPlatformBridge(true, call as typeof invoke);
    await expect(bridge.getSystemSummary()).rejects.toThrow("native unavailable");
    await expect(bridge.openFolder("documents")).rejects.toThrow("native unavailable");
  });

  it("ends the Linux session through the fixed exit command", async () => {
    const call = vi.fn().mockResolvedValue(undefined);
    expect(await createPlatformBridge(true, call as typeof invoke).exitSession()).toBe(true);
    expect(call).toHaveBeenCalledExactlyOnceWith("exit_session");
  });

  it("reports a failed native exit so the desktop can fall back", async () => {
    const call = vi.fn().mockRejectedValue(new Error("nope"));
    await expect(createPlatformBridge(true, call as typeof invoke).exitSession()).rejects.toThrow("nope");
  });
});
