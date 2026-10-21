import { useEffect, useState } from "react";

export type SettingsSection = "system" | "updates" | "display" | "account" | "wallpaper" | "sounds";
export interface SystemPreferences { deviceName: string; automaticUpdates: boolean; updateChannel: "stable" | "testing" }
export const DEFAULT_SYSTEM_PREFERENCES: SystemPreferences = { deviceName: "My Cheesecake desktop", automaticUpdates: false, updateChannel: "stable" };
const KEY = "cheesecake-system-preferences";
const EVENT = "cheesecake-settings-change";
export const normalizePreferences = (value: Partial<SystemPreferences>): SystemPreferences => ({
  deviceName: typeof value.deviceName === "string" && value.deviceName.trim() ? value.deviceName.trim().slice(0, 64) : DEFAULT_SYSTEM_PREFERENCES.deviceName,
  automaticUpdates: value.automaticUpdates === true,
  updateChannel: value.updateChannel === "testing" ? "testing" : "stable",
});
const read = (): SystemPreferences => {
  try { return normalizePreferences(JSON.parse(localStorage.getItem(KEY) || "{}") ?? {}); } catch { return { ...DEFAULT_SYSTEM_PREFERENCES }; }
};
export function useSystemPreferences() {
  const [preferences, setPreferences] = useState(read);
  useEffect(() => {
    const refresh = () => setPreferences(read());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, []);
  const update = (patch: Partial<SystemPreferences>) => {
    const next = normalizePreferences({ ...read(), ...patch });
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { return false; }
    setPreferences(next);
    window.dispatchEvent(new Event(EVENT));
    return true;
  };
  return { preferences, update };
}
export const openSettingsSection = (section: SettingsSection) => {
  try { sessionStorage.setItem("cheesecake-settings-section", section); } catch { /* Keep direct navigation available. */ }
  window.dispatchEvent(new CustomEvent("cheesecake-settings-section", { detail: section }));
};
export const initialSettingsSection = (): SettingsSection => {
  try {
    const section = sessionStorage.getItem("cheesecake-settings-section");
    if (["system", "updates", "display", "account", "wallpaper", "sounds"].includes(section || "")) return section as SettingsSection;
  } catch { /* Use default tab. */ }
  return "system";
};