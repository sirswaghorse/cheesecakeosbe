import StartButton from "./StartButton";
import TaskbarButtons from "./TaskbarButtons";
import Clock from "./Clock";

const Taskbar = () => {
  return (
    <div className="win-glass fixed bottom-0 left-0 right-0 h-12 flex items-center z-[9998]">
      <StartButton />
      <TaskbarButtons />
      <div className="flex items-center gap-1 mr-1">
        <span className="text-xs text-white/60 px-1">🔊</span>
        <span className="text-xs text-white/60 px-1">🌐</span>
        <Clock />
      </div>
    </div>
  );
};

export default Taskbar;
