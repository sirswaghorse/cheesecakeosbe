import { useRef, useCallback, type MouseEvent, Suspense } from "react";
import { useWindows } from "@/contexts/WindowContext";
import type { WindowState } from "@/types/windows";
import { getApp } from "@/config/apps";

interface WindowProps {
  win: WindowState;
}

const TASKBAR_HEIGHT = 48;

const Window = ({ win }: WindowProps) => {
  const { closeWindow, minimizeWindow, toggleMaximize, focusWindow, moveWindow } = useWindows();
  const app = getApp(win.appId);
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      if (win.maximized) return;
      e.preventDefault();
      focusWindow(win.id);
      dragRef.current = { startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y };

      const onMove = (ev: globalThis.MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        const newX = dragRef.current.winX + dx;
        const newY = Math.max(0, Math.min(dragRef.current.winY + dy, window.innerHeight - TASKBAR_HEIGHT - 30));
        moveWindow(win.id, newX, newY);
      };

      const onUp = () => {
        dragRef.current = null;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [win.id, win.x, win.y, win.maximized, focusWindow, moveWindow]
  );

  if (!app || win.minimized) return null;

  const AppComponent = app.component;
  const isActive = win.focused;

  const style = win.maximized
    ? { top: 0, left: 0, width: "100%", height: `calc(100vh - ${TASKBAR_HEIGHT}px)`, zIndex: win.zIndex }
    : { top: win.y, left: win.x, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <div
      className={`absolute flex flex-col rounded-lg overflow-hidden ${isActive ? "win-window-shadow" : "win-window-shadow-inactive"}`}
      style={style}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title bar */}
      <div
        className={`flex items-center h-8 px-2 gap-2 shrink-0 cursor-move select-none ${isActive ? "win-titlebar-gradient" : "win-titlebar-inactive"}`}
        onMouseDown={onMouseDown}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <span className="text-sm">{app.icon}</span>
        <span className="text-xs font-medium text-white/90 flex-1 truncate">{app.name}</span>
        <div className="flex gap-0.5">
          <button
            className="win-btn-minmax w-6 h-5 rounded-sm flex items-center justify-center text-white/80 hover:text-white text-xs"
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
          >
            ─
          </button>
          <button
            className="win-btn-minmax w-6 h-5 rounded-sm flex items-center justify-center text-white/80 hover:text-white text-xs"
            onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }}
          >
            {win.maximized ? "❐" : "□"}
          </button>
          <button
            className="win-btn-close w-6 h-5 rounded-sm flex items-center justify-center text-white/90 hover:text-white text-xs"
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
          >
            ✕
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto" style={{ background: "hsl(220 14% 96%)" }}>
        <Suspense fallback={<div className="flex items-center justify-center h-full text-sm" style={{ color: "hsl(210 10% 50%)" }}>Loading...</div>}>
          <AppComponent />
        </Suspense>
      </div>
    </div>
  );
};

export default Window;
