import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InstalledAppsContextType {
  installedAppIds: Set<string>;
  installApp: (appId: string) => void;
  uninstallApp: (appId: string) => void;
  isInstalled: (appId: string) => boolean;
}

const LOCAL_KEY = "cheesecake_installed_apps";

const InstalledAppsContext = createContext<InstalledAppsContextType | null>(null);

export const InstalledAppsProvider = ({ children }: { children: ReactNode }) => {
  const [installedAppIds, setInstalledAppIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]")); } catch { return new Set(); }
  });

  // Installed apps always persist on this computer
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...installedAppIds]));
  }, [installedAppIds]);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth changes and load installed apps
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Optional cloud sync: merge cloud installs into the local list when signed in
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("installed_apps")
      .select("app_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) {
          setInstalledAppIds((prev) => new Set([...prev, ...data.map((r) => r.app_id)]));
        }
      });
  }, [userId]);

  const installApp = useCallback((appId: string) => {
    setInstalledAppIds((prev) => new Set(prev).add(appId));
    if (userId) {
      supabase.from("installed_apps").insert({ user_id: userId, app_id: appId }).then();
    }
  }, [userId]);

  const uninstallApp = useCallback((appId: string) => {
    setInstalledAppIds((prev) => {
      const next = new Set(prev);
      next.delete(appId);
      return next;
    });
    if (userId) {
      supabase.from("installed_apps").delete().eq("user_id", userId).eq("app_id", appId).then();
    }
  }, [userId]);

  const isInstalled = useCallback(
    (appId: string) => installedAppIds.has(appId),
    [installedAppIds]
  );

  return (
    <InstalledAppsContext.Provider value={{ installedAppIds, installApp, uninstallApp, isInstalled }}>
      {children}
    </InstalledAppsContext.Provider>
  );
};

export const useInstalledApps = () => {
  const ctx = useContext(InstalledAppsContext);
  if (!ctx) throw new Error("useInstalledApps must be used within InstalledAppsProvider");
  return ctx;
};
