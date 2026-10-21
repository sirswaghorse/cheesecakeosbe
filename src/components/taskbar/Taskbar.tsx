import StartButton from "./StartButton";
import TaskbarButtons from "./TaskbarButtons";
import Clock from "./Clock";
import { useWindows } from "@/contexts/WindowContext";

const Taskbar = ({ onShutdown }: { onShutdown?: () => void }) => {
  const { setDesktopPeek, toggleShowDesktop } = useWindows();
  return (
    <div className="win-glass fixed bottom-0 left-0 right-0 h-12 flex items-center z-[9998]">
      <StartButton onShutdown={onShutdown} />
      <TaskbarButtons />
      <div className="flex items-center gap-1 mr-1">
        <span className="text-xs text-white/60 px-1">🔊</span>
        <span className="text-xs text-white/60 px-1">🌐</span>
        <Clock />
      </div>
      <button
        aria-label="Show desktop"
        title="Show desktop"
        className="h-full w-3 border-l border-border/40 hover:bg-primary/30 transition-colors"
        onMouseEnter={() => setDesktopPeek(true)}
        onMouseLeave={() => setDesktopPeek(false)}
        onClick={() => { setDesktopPeek(false); toggleShowDesktop(); }}
      />
    </div>
  );
};

export default Taskbar;
