import { invoke, isTauri } from "@tauri-apps/api/core";

export const KNOWN_FOLDERS = ["documents", "pictures", "music", "videos", "downloads"] as const;
export type KnownFolder = typeof KNOWN_FOLDERS[number];
export interface SystemSummary {
  os: string;
  osVersion: string;
  kernel: string;
  hostname: string;
  totalMemory: number;
  usedMemory: number;
}
export interface PlatformBridge {
  environment: "browser" | "linux";
  getSystemSummary: () => Promise<SystemSummary | null>;
  openFolder: (folder: KnownFolder) => Promise<void>;
}

/** No paths, executables, or shell text cross IPC. */
export function createPlatformBridge(native: boolean, call: typeof invoke = invoke): PlatformBridge {
  return {
    environment: native ? "linux" : "browser",
    getSystemSummary: () => native ? call<SystemSummary>("system_summary") : Promise.resolve(null),
    async openFolder(folder) {
      if (!KNOWN_FOLDERS.includes(folder)) throw new Error("Unsupported folder.");
      if (!native) throw new Error("The system file manager is available in the Linux desktop only.");
      await call<void>("open_known_folder", { folder });
    },
  };
}

export const platformBridge = createPlatformBridge(isTauri());