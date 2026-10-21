import { useRef, useState } from "react";
import { useWindows } from "@/contexts/WindowContext";
import { getApp } from "@/config/apps";
import { Button } from "@/components/ui/button";

const TaskbarButtons = () => {
  const { windows, taskbarClick, closeWindow, focusWindow, setPeekId } = useWindows();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const timer = useRef<number>();

  const enter = (id: string) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHoverId(id), 350);
  };
  const leave = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setHoverId(null);
      setPeekId(null);
    }, 200);
  };

  return (
    <div className="flex items-center gap-1 flex-1 px-1">
      {windows.map((win) => {
        const app = getApp(win.appId);
        if (!app) return null;
        const icon = app.icon.includes("/") ? (
          <img src={app.icon} alt="" width={20} height={20} className="h-5 w-5 shrink-0 object-contain" />
        ) : (
          <span className="text-sm shrink-0">{app.icon}</span>
        );
        return (
          <div key={win.id} className="relative" onMouseEnter={() => enter(win.id)} onMouseLeave={leave}>
            <Button
              variant="ghost"
              className={`h-9 px-3 rounded flex items-center gap-1.5 min-w-0 max-w-[180px] transition-colors ${
                win.focused && !win.minimized ? "win-taskbar-btn-active" : "win-taskbar-btn"
              }`}
              onClick={() => taskbarClick(win.id)}
            >
              {icon}
              <span className="text-xs text-foreground/90 truncate">{app.name}</span>
            </Button>
            {hoverId === win.id && (
              <div
                className="win-glass absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 rounded-lg p-2 animate-in fade-in slide-in-from-bottom-1 duration-150"
                onMouseEnter={() => !win.minimized && setPeekId(win.id)}
                onMouseLeave={() => setPeekId(null)}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  {icon}
                  <span className="text-xs text-foreground/90 truncate flex-1">{app.name}</span>
                  <button
                    aria-label={`Close ${app.name}`}
                    className="win-btn-close w-5 h-5 rounded-sm text-xs text-foreground/90"
                    onClick={() => { closeWindow(win.id); setHoverId(null); setPeekId(null); }}
                  >
                    ✕
                  </button>
                </div>
                <button
                  className="w-full h-24 rounded border border-border/40 bg-background/30 flex items-center justify-center hover:border-primary/70 transition-colors"
                  onClick={() => {
                    if (win.minimized) taskbarClick(win.id);
                    else focusWindow(win.id);
                    setHoverId(null);
                    setPeekId(null);
                  }}
                >
                  {app.icon.includes("/") ? (
                    <img src={app.icon} alt="" className="h-12 w-12 object-contain" />
                  ) : (
                    <span className="text-4xl">{app.icon}</span>
                  )}
                </button>
                {win.minimized && <p className="text-[10px] text-foreground/60 mt-1 text-center">Minimized</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TaskbarButtons;
