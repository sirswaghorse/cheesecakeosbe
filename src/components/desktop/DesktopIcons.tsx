import { appRegistry } from "@/config/apps";
import { useWindows } from "@/contexts/WindowContext";
import { useInstalledApps } from "@/contexts/InstalledAppsContext";
import winampLogo from "@/assets/winamp-logo.png";

interface DesktopIconsProps {
  onWebampOpen?: () => void;
}

const DesktopIcons = ({ onWebampOpen }: DesktopIconsProps) => {
  const { openApp } = useWindows();
  const { installedAppIds } = useInstalledApps();
  const desktopApps = appRegistry.filter(
    (a) => a.desktopIcon || installedAppIds.has(a.id)
  );

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-1">
      {desktopApps.map((app) => (
        <div
          key={app.id}
          className="win-desktop-icon"
          onDoubleClick={() => openApp(app.id)}
        >
          {app.icon.startsWith("/") || app.icon.includes("/") ? (
            <img src={app.icon} alt={app.name} className="w-8 h-8 drop-shadow-md rounded object-cover" />
          ) : (
            <span className="text-3xl drop-shadow-md">{app.icon}</span>
          )}
          <span className="text-xs text-white drop-shadow-md leading-tight">{app.name}</span>
        </div>
      ))}
      {/* Webamp — launches its own floating UI */}
      <div
        className="win-desktop-icon"
        onDoubleClick={onWebampOpen}
      >
        <img src={winampLogo} alt="Winamp" className="w-8 h-8 drop-shadow-md" />
        <span className="text-xs text-white drop-shadow-md leading-tight">Winamp</span>
      </div>
    </div>
  );
};

export default DesktopIcons;
