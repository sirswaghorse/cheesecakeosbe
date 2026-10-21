import { useState } from "react";
import DesktopIcons, { type IconSize, type SortMode } from "./DesktopIcons";
import WindowManager from "@/components/window/WindowManager";
import { useWallpaper } from "@/contexts/WallpaperContext";
import { useWindows } from "@/contexts/WindowContext";
import { toBackgroundImage } from "@/config/wallpaperPresets";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuRadioGroup, ContextMenuRadioItem,
  ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface DesktopProps {
  onWebampOpen?: () => void;
}

const Desktop = ({ onWebampOpen }: DesktopProps) => {
  const { wallpaper } = useWallpaper();
  const { openApp } = useWindows();
  const [iconSize, setIconSize] = useState<IconSize>(() => (localStorage.getItem("cc-icon-size") as IconSize) || "medium");
  const [sortMode, setSortMode] = useState<SortMode>(() => (localStorage.getItem("cc-icon-sort") as SortMode) || "default");
  const [refreshKey, setRefreshKey] = useState(0);

  const changeSize = (v: string) => { setIconSize(v as IconSize); localStorage.setItem("cc-icon-size", v); };
  const changeSort = (v: string) => { setSortMode(v as SortMode); localStorage.setItem("cc-icon-sort", v); };

  return (
    <div
      className="fixed inset-0 pb-12 overflow-hidden"
      style={{ backgroundImage: toBackgroundImage(wallpaper), backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="absolute inset-0 bottom-12">
            <div key={refreshKey} className="animate-fade-in h-full">
              <DesktopIcons onWebampOpen={onWebampOpen} iconSize={iconSize} sortMode={sortMode} />
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          <ContextMenuSub>
            <ContextMenuSubTrigger>View</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup value={iconSize} onValueChange={changeSize}>
                <ContextMenuRadioItem value="large">Large icons</ContextMenuRadioItem>
                <ContextMenuRadioItem value="medium">Medium icons</ContextMenuRadioItem>
                <ContextMenuRadioItem value="small">Small icons</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Sort by</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup value={sortMode} onValueChange={changeSort}>
                <ContextMenuRadioItem value="default">Default order</ContextMenuRadioItem>
                <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem onSelect={() => setRefreshKey((k) => k + 1)}>Refresh</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>New</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onSelect={() => openApp("notepad")}>Text Document</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => openApp("terminal")}>Open Terminal</ContextMenuItem>
          <ContextMenuItem onSelect={() => openApp("taskmanager")}>Task Manager</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => openApp("controlpanel")}>Personalize</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <WindowManager />
    </div>
  );
};

export default Desktop;
