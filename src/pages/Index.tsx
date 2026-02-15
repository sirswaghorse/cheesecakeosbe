import { useState, useCallback } from "react";
import { WindowProvider } from "@/contexts/WindowContext";
import { WallpaperProvider } from "@/contexts/WallpaperContext";
import { InstalledAppsProvider } from "@/contexts/InstalledAppsContext";
import Desktop from "@/components/desktop/Desktop";
import Taskbar from "@/components/taskbar/Taskbar";
import { useWebamp } from "@/hooks/useWebamp";
import ShutdownOverlay from "@/components/ShutdownOverlay";

const DesktopShell = ({ onShutdown }: { onShutdown: () => void }) => {
  const { open: openWebamp } = useWebamp();

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Desktop onWebampOpen={openWebamp} />
      <Taskbar onShutdown={onShutdown} />
    </div>
  );
};

const Index = () => {
  const [phase, setPhase] = useState<"desktop" | "shuttingDown" | "off" | "booting">("desktop");

  const handleShutdown = useCallback(() => {
    setPhase("shuttingDown");
    setTimeout(() => setPhase("off"), 2000);
  }, []);

  const handleBoot = useCallback(() => {
    setPhase("booting");
    setTimeout(() => setPhase("desktop"), 3000);
  }, []);

  if (phase === "off") {
    return (
      <div
        className="h-screen w-screen bg-black cursor-pointer"
        onClick={handleBoot}
      />
    );
  }

  return (
    <WallpaperProvider>
      <InstalledAppsProvider>
        <WindowProvider>
          {phase === "desktop" && <DesktopShell onShutdown={handleShutdown} />}
          {(phase === "shuttingDown" || phase === "booting") && (
            <ShutdownOverlay phase={phase} />
          )}
        </WindowProvider>
      </InstalledAppsProvider>
    </WallpaperProvider>
  );
};

export default Index;
