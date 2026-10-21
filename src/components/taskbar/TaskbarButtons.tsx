import { useWindows } from "@/contexts/WindowContext";
import { getApp } from "@/config/apps";
import { Button } from "@/components/ui/button";

const TaskbarButtons = () => {
  const { windows, taskbarClick } = useWindows();

  return (
    <div className="flex items-center gap-1 flex-1 px-1 overflow-hidden">
      {windows.map((win) => {
        const app = getApp(win.appId);
        if (!app) return null;
        return (
          <Button
            variant="ghost"
            key={win.id}
            className={`h-9 px-3 rounded flex items-center gap-1.5 min-w-0 max-w-[180px] transition-colors ${
              win.focused && !win.minimized ? "win-taskbar-btn-active" : "win-taskbar-btn"
            }`}
            onClick={() => taskbarClick(win.id)}
          >
            {app.icon.includes("/") ? <img src={app.icon} alt="" width={20} height={20} className="h-5 w-5 shrink-0 object-contain" /> : <span className="text-sm shrink-0">{app.icon}</span>}
            <span className="text-xs text-foreground/90 truncate">{app.name}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default TaskbarButtons;
