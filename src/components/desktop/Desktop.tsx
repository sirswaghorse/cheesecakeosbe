import defaultWallpaper from "@/assets/wallpaper.jpg";
import DesktopIcons from "./DesktopIcons";
import WindowManager from "@/components/window/WindowManager";
import { useWallpaper } from "@/contexts/WallpaperContext";

interface DesktopProps {
  onWebampOpen?: () => void;
}

const Desktop = ({ onWebampOpen }: DesktopProps) => {
  const { wallpaper } = useWallpaper();
  const bgImage = wallpaper || defaultWallpaper;

  return (
    <div
      className="fixed inset-0 pb-12 overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
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
