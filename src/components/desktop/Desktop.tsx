import wallpaper from "@/assets/wallpaper.jpg";
import DesktopIcons from "./DesktopIcons";
import WindowManager from "@/components/window/WindowManager";

const Desktop = () => {
  return (
    <div
      className="fixed inset-0 pb-12 overflow-hidden"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <DesktopIcons />
      <WindowManager />
    </div>
  );
};

export default Desktop;
