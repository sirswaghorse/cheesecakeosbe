import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface WallpaperContextType {
  wallpaper: string;
  setWallpaper: (url: string) => void;
}

const WallpaperContext = createContext<WallpaperContextType | null>(null);

export const WallpaperProvider = ({ children }: { children: ReactNode }) => {
  const [wallpaper, setWallpaperState] = useState<string>(() => {
    return localStorage.getItem("horseshoe-wallpaper") || "";
  });

  const setWallpaper = useCallback((url: string) => {
    setWallpaperState(url);
    if (url) {
      localStorage.setItem("horseshoe-wallpaper", url);
    } else {
      localStorage.removeItem("horseshoe-wallpaper");
    }
  }, []);

  return (
    <WallpaperContext.Provider value={{ wallpaper, setWallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
};

export const useWallpaper = () => {
  const ctx = useContext(WallpaperContext);
  if (!ctx) throw new Error("useWallpaper must be inside WallpaperProvider");
  return ctx;
};
