import DesktopIcons from "./DesktopIcons";
import WindowManager from "@/components/window/WindowManager";
import { useWallpaper } from "@/contexts/WallpaperContext";
import { toBackgroundImage } from "@/config/wallpaperPresets";

interface DesktopProps {
  onWebampOpen?: () => void;
}

const Desktop = ({ onWebampOpen }: DesktopProps) => {
  const { wallpaper } = useWallpaper();

  return (
    <div
      className="fixed inset-0 pb-12 overflow-hidden"
      style={{
        backgroundImage: toBackgroundImage(wallpaper),
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <DesktopIcons onWebampOpen={onWebampOpen} />
      <WindowManager />
    </div>
  );
};

export default Desktop;
