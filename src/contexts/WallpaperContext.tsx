import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WallpaperContextType {
  wallpaper: string;
  setWallpaper: (url: string) => void;
}

const WallpaperContext = createContext<WallpaperContextType | null>(null);

export const WallpaperProvider = ({ children }: { children: ReactNode }) => {
  const [wallpaper, setWallpaperState] = useState<string>(() => {
    return localStorage.getItem("horseshoe-wallpaper") || "";
  });

  // Load wallpaper from DB on auth
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from("user_preferences")
        .select("wallpaper_url")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data?.wallpaper_url) {
        setWallpaperState(data.wallpaper_url);
        localStorage.setItem("horseshoe-wallpaper", data.wallpaper_url);
      }
    };
    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) load();
    });
    return () => subscription.unsubscribe();
  }, []);

  const setWallpaper = useCallback(async (url: string) => {
    setWallpaperState(url);
    if (url) {
      localStorage.setItem("horseshoe-wallpaper", url);
    } else {
      localStorage.removeItem("horseshoe-wallpaper");
    }

    // Persist to DB if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const userId = session.user.id;
    const { data: existing } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_preferences")
        .update({ wallpaper_url: url || null, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    } else {
      await supabase
        .from("user_preferences")
        .insert({ user_id: userId, wallpaper_url: url || null });
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
