import { useMemo, useState } from "react";
import { appRegistry } from "@/config/apps";
import { useWindows } from "@/contexts/WindowContext";
import { useInstalledApps } from "@/contexts/InstalledAppsContext";
import { isDefaultApp } from "@/config/storeCatalog";
import winampLogo from "@/assets/winamp-logo.png";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { AppConfig } from "@/types/windows";

export type IconSize = "small" | "medium" | "large";
export type SortMode = "default" | "name";

interface DesktopIconsProps {
  onWebampOpen?: () => void;
  iconSize?: IconSize;
  sortMode?: SortMode;
}

const sizeClass: Record<IconSize, string> = { small: "w-6 h-6", medium: "w-8 h-8", large: "w-12 h-12" };
const emojiClass: Record<IconSize, string> = { small: "text-2xl", medium: "text-3xl", large: "text-5xl" };

const DesktopIcons = ({ onWebampOpen, iconSize = "medium", sortMode = "default" }: DesktopIconsProps) => {
  const { openApp } = useWindows();
  const { installedAppIds, uninstallApp } = useInstalledApps();
  const [props, setProps] = useState<AppConfig | null>(null);

  const desktopApps = useMemo(() => {
    const list = appRegistry.filter((a) => a.desktopIcon || installedAppIds.has(a.id));
    return sortMode === "name" ? [...list].sort((a, b) => a.name.localeCompare(b.name)) : list;
  }, [installedAppIds, sortMode]);

  const renderIcon = (app: AppConfig) =>
    app.icon.includes("/") ? (
      <img src={app.icon} alt={app.name} className={`${sizeClass[iconSize]} drop-shadow-md rounded object-cover`} />
    ) : (
      <span className={`${emojiClass[iconSize]} drop-shadow-md`}>{app.icon}</span>
    );

  return (
    <>
      <div className="absolute top-4 left-4 flex flex-col flex-wrap max-h-[calc(100%-2rem)] gap-1">
        {desktopApps.map((app) => (
          <ContextMenu key={app.id}>
            <ContextMenuTrigger asChild>
              <div className="win-desktop-icon" onDoubleClick={() => openApp(app.id)} onContextMenu={(e) => e.stopPropagation()}>
                {renderIcon(app)}
                <span className="text-xs text-white drop-shadow-md leading-tight">{app.name}</span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem className="font-semibold" onSelect={() => openApp(app.id)}>Open</ContextMenuItem>
              <ContextMenuSeparator />
              {!isDefaultApp(app.id) && installedAppIds.has(app.id) && (
                <ContextMenuItem onSelect={() => uninstallApp(app.id)}>Uninstall</ContextMenuItem>
              )}
              <ContextMenuItem onSelect={() => setProps(app)}>Properties</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="win-desktop-icon" onDoubleClick={onWebampOpen} onContextMenu={(e) => e.stopPropagation()}>
              <img src={winampLogo} alt="Winamp" className={`${sizeClass[iconSize]} drop-shadow-md`} />
              <span className="text-xs text-white drop-shadow-md leading-tight">Winamp</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuItem className="font-semibold" onSelect={() => onWebampOpen?.()}>Open</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      {props && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/30" onClick={() => setProps(null)}>
          <div className="win-glass rounded-lg p-4 w-72 text-foreground" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              {renderIcon(props)}
              <div>
                <div className="font-semibold">{props.name}</div>
                <div className="text-xs opacity-70">{isDefaultApp(props.id) ? "System app" : "Installed app"}</div>
              </div>
            </div>
            <dl className="text-xs grid grid-cols-2 gap-1 mb-3">
              <dt className="opacity-70">App ID</dt><dd>{props.id}</dd>
              <dt className="opacity-70">Window size</dt><dd>{props.defaultWidth} × {props.defaultHeight}</dd>
              <dt className="opacity-70">Can uninstall</dt><dd>{isDefaultApp(props.id) ? "No" : "Yes"}</dd>
            </dl>
            <button className="w-full rounded bg-primary text-primary-foreground py-1 text-sm" onClick={() => setProps(null)}>OK</button>
          </div>
        </div>
      )}
    </>
  );
};

export default DesktopIcons;
