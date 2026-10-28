import officialWallpaper from "@/assets/cheesecake_os_wallpaper.jpg";

export interface WallpaperPreset {
  id: string;
  name: string;
  /** Empty string means the official default wallpaper. */
  value: string;
}

export const wallpaperPresets: WallpaperPreset[] = [
  { id: "official", name: "Blueberry Official", value: "" },
  { id: "lavender-dusk", name: "Lavender Dusk", value: "linear-gradient(135deg, #1e293b 0%, #4338ca 55%, #818cf8 100%)" },
  { id: "frosted-berry", name: "Frosted Berry", value: "linear-gradient(160deg, #e0e7ff 0%, #818cf8 50%, #3b82f6 100%)" },
  { id: "midnight-jam", name: "Midnight Jam", value: "radial-gradient(circle at 30% 30%, #3b82f6 0%, #1e1b4b 60%, #0f172a 100%)" },
  { id: "aero-sky", name: "Aero Sky", value: "linear-gradient(180deg, #0ea5e9 0%, #3b82f6 50%, #1e3a8a 100%)" },
  { id: "cream-cheese", name: "Cream Cheese", value: "linear-gradient(135deg, #fef9c3 0%, #e0e7ff 60%, #a5b4fc 100%)" },
];

export const officialWallpaperUrl = officialWallpaper;

/** Turns a stored wallpaper value into a CSS background-image value. */
export const toBackgroundImage = (value: string): string => {
  if (!value) return `url(${officialWallpaperUrl})`;
  if (/^(linear|radial|conic)-gradient\(/.test(value)) return value;
  return `url(${value})`;
};
