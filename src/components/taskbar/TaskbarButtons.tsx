import { useWindows } from "@/contexts/WindowContext";
import { getApp } from "@/config/apps";

const TaskbarButtons = () => {
  const { windows, taskbarClick } = useWindows();

  return (
    <div className="flex items-center gap-1 flex-1 px-1 overflow-hidden">
      {windows.map((win) => {
        const app = getApp(win.appId);
        if (!app) return null;
        return (
          <button
            key={win.id}
            className={`h-9 px-3 rounded flex items-center gap-1.5 min-w-0 max-w-[180px] transition-colors ${
              win.focused && !win.minimized ? "win-taskbar-btn-active" : "win-taskbar-btn"
            }`}
            onClick={() => taskbarClick(win.id)}
          >
            <span className="text-sm shrink-0">{app.icon}</span>
            <span className="text-xs text-white/90 truncate">{app.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TaskbarButtons;
