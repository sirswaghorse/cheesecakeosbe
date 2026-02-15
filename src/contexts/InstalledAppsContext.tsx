import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface InstalledAppsContextType {
  installedAppIds: Set<string>;
  installApp: (appId: string) => void;
  isInstalled: (appId: string) => boolean;
}

const InstalledAppsContext = createContext<InstalledAppsContextType | null>(null);

export const InstalledAppsProvider = ({ children }: { children: ReactNode }) => {
  const [installedAppIds, setInstalledAppIds] = useState<Set<string>>(new Set());

  const installApp = useCallback((appId: string) => {
    setInstalledAppIds((prev) => new Set(prev).add(appId));
  }, []);

  const isInstalled = useCallback(
    (appId: string) => installedAppIds.has(appId),
    [installedAppIds]
  );

  return (
    <InstalledAppsContext.Provider value={{ installedAppIds, installApp, isInstalled }}>
      {children}
    </InstalledAppsContext.Provider>
  );
};

export const useInstalledApps = () => {
  const ctx = useContext(InstalledAppsContext);
  if (!ctx) throw new Error("useInstalledApps must be used within InstalledAppsProvider");
  return ctx;
};
