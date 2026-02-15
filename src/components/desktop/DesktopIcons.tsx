import { appRegistry } from "@/config/apps";
import { useWindows } from "@/contexts/WindowContext";

interface DesktopIconsProps {
  onWebampOpen?: () => void;
}

const DesktopIcons = ({ onWebampOpen }: DesktopIconsProps) => {
  const { openApp } = useWindows();
  const desktopApps = appRegistry.filter((a) => a.desktopIcon);

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-1">
      {desktopApps.map((app) => (
        <div
          key={app.id}
          className="win-desktop-icon"
          onDoubleClick={() => openApp(app.id)}
        >
          <span className="text-3xl drop-shadow-md">{app.icon}</span>
          <span className="text-xs text-white drop-shadow-md leading-tight">{app.name}</span>
        </div>
      ))}
      {/* Webamp — launches its own floating UI */}
      <div
        className="win-desktop-icon"
        onDoubleClick={onWebampOpen}
      >
        <span className="text-3xl drop-shadow-md">🎵</span>
        <span className="text-xs text-white drop-shadow-md leading-tight">Winamp</span>
      </div>
    </div>
  );
};

export default DesktopIcons;
