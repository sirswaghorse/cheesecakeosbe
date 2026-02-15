import wallpaper from "@/assets/wallpaper.jpg";
import DesktopIcons from "./DesktopIcons";
import WindowManager from "@/components/window/WindowManager";

interface DesktopProps {
  onWebampOpen?: () => void;
}

const Desktop = ({ onWebampOpen }: DesktopProps) => {
  return (
    <div
      className="fixed inset-0 pb-12 overflow-hidden"
      style={{
        backgroundImage: `url(${wallpaper})`,
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
