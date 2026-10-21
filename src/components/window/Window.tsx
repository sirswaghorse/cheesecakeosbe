import { useRef, useCallback, useState, type MouseEvent, Suspense } from "react";
import { useWindows } from "@/contexts/WindowContext";
import type { WindowState } from "@/types/windows";
import { getApp } from "@/config/apps";

interface WindowProps {
  win: WindowState;
}

const TASKBAR_HEIGHT = 48;
const EDGE = 8;

type SnapZone = "left" | "right" | "top" | null;

const zoneRect = (zone: Exclude<SnapZone, null>) => {
  const w = window.innerWidth;
  const h = window.innerHeight - TASKBAR_HEIGHT;
  if (zone === "left") return { x: 0, y: 0, width: Math.round(w / 2), height: h };
  if (zone === "right") return { x: Math.round(w / 2), y: 0, width: w - Math.round(w / 2), height: h };
  return { x: 0, y: 0, width: w, height: h };
};

const Window = ({ win }: WindowProps) => {
  const { closeWindow, minimizeWindow, toggleMaximize, focusWindow, moveWindow, snapWindow, unsnapWindow, peekId, desktopPeek } = useWindows();
  const app = getApp(win.appId);
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number; unsnapped: boolean } | null>(null);
  const [zone, setZone] = useState<SnapZone>(null);

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      if (win.maximized) return;
      e.preventDefault();
      focusWindow(win.id);
      dragRef.current = { startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y, unsnapped: !win.restore };
      let currentZone: SnapZone = null;

      const onMove = (ev: globalThis.MouseEvent) => {
        const d = dragRef.current;
        if (!d) return;
        // Pull a snapped window off the edge: restore its size under the cursor
        if (!d.unsnapped) {
          if (Math.abs(ev.clientX - d.startX) + Math.abs(ev.clientY - d.startY) < 6) return;
          const restore = win.restore;
          if (!restore) return;
          const rw = restore.width;
          const ratio = (d.startX - win.x) / win.width;
          d.winX = Math.round(ev.clientX - rw * ratio);
          d.winY = Math.max(0, ev.clientY - 14);
          d.startX = ev.clientX;
          d.startY = ev.clientY;
          d.unsnapped = true;
          unsnapWindow(win.id, d.winX, d.winY);
          return;
        }
        const dx = ev.clientX - d.startX;
        const dy = ev.clientY - d.startY;
        const newX = d.winX + dx;
        const newY = Math.max(0, Math.min(d.winY + dy, window.innerHeight - TASKBAR_HEIGHT - 30));
        moveWindow(win.id, newX, newY);
        const z: SnapZone = ev.clientY <= EDGE ? "top" : ev.clientX <= EDGE ? "left" : ev.clientX >= window.innerWidth - EDGE ? "right" : null;
        if (z !== currentZone) {
          currentZone = z;
          setZone(z);
        }
      };

      const onUp = () => {
        dragRef.current = null;
        if (currentZone) snapWindow(win.id, zoneRect(currentZone));
        setZone(null);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [win.id, win.x, win.y, win.width, win.restore, win.maximized, focusWindow, moveWindow, snapWindow, unsnapWindow]
  );

  if (!app || win.minimized) return null;

  const AppComponent = app.component;
  const isActive = win.focused;

  const peeking = desktopPeek || (peekId !== null && peekId !== win.id);
  const peekStyle = peeking
    ? { opacity: 0.08, transition: "opacity 200ms" }
    : peekId === win.id
    ? { zIndex: 9990, transition: "opacity 200ms" }
    : { transition: "opacity 200ms" };

  const style = win.maximized
    ? { top: 0, left: 0, width: "100%", height: `calc(100vh - ${TASKBAR_HEIGHT}px)`, zIndex: win.zIndex, ...peekStyle }
    : { top: win.y, left: win.x, width: win.width, height: win.height, zIndex: win.zIndex, ...peekStyle };

  const ghost = zone ? zoneRect(zone) : null;

  return (
    <>
    {ghost && (
      <div
        className="fixed rounded-lg pointer-events-none border-2 border-primary/70 bg-primary/20 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150"
        style={{ left: ghost.x + 6, top: ghost.y + 6, width: ghost.width - 12, height: ghost.height - 12, zIndex: win.zIndex - 1 }}
      />
    )}
    <div
      className={`absolute flex flex-col rounded-lg overflow-hidden ${win.appId === "appstore" || win.appId === "controlpanel" ? "store-window" : ""} ${isActive ? "win-window-shadow" : "win-window-shadow-inactive"}`}
      style={style}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title bar */}
      <div
        className={`flex items-center h-8 px-2 gap-2 shrink-0 cursor-move select-none ${isActive ? "win-titlebar-gradient" : "win-titlebar-inactive"}`}
        onMouseDown={onMouseDown}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        {app.icon.startsWith("/") || app.icon.includes("/") ? (
          <img src={app.icon} alt={app.name} className="w-4 h-4 rounded object-cover" />
        ) : (
          <span className="text-sm">{app.icon}</span>
        )}
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
    </>
  );
};

export default Window;
