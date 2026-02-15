import { WindowProvider } from "@/contexts/WindowContext";
import Desktop from "@/components/desktop/Desktop";
import Taskbar from "@/components/taskbar/Taskbar";
import { useWebamp } from "@/hooks/useWebamp";

const DesktopShell = () => {
  const { open: openWebamp } = useWebamp();

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Desktop onWebampOpen={openWebamp} />
      <Taskbar />
    </div>
  );
};

const Index = () => {
  return (
    <WindowProvider>
      <DesktopShell />
    </WindowProvider>
  );
};

export default Index;
