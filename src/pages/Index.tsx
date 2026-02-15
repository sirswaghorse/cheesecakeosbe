import { WindowProvider } from "@/contexts/WindowContext";
import Desktop from "@/components/desktop/Desktop";
import Taskbar from "@/components/taskbar/Taskbar";

const Index = () => {
  return (
    <WindowProvider>
      <div className="h-screen w-screen overflow-hidden">
        <Desktop />
        <Taskbar />
      </div>
    </WindowProvider>
  );
};

export default Index;
