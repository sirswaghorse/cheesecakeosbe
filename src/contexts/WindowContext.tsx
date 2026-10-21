import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { WindowState } from "@/types/windows";
import { getApp } from "@/config/apps";

interface WindowContextType {
  windows: WindowState[];
  openApp: (appId: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  /** Clicking a taskbar button: restore if minimized, focus if behind, minimize if focused */
  taskbarClick: (id: string) => void;
  snapWindow: (id: string, rect: { x: number; y: number; width: number; height: number }) => void;
  unsnapWindow: (id: string, x: number, y: number) => void;
  /** Window being previewed from the taskbar (Aero Peek) */
  peekId: string | null;
  setPeekId: (id: string | null) => void;
  /** Show-desktop corner hovered: all windows become transparent */
  desktopPeek: boolean;
  setDesktopPeek: (v: boolean) => void;
  toggleShowDesktop: () => void;
}

const WindowContext = createContext<WindowContextType | null>(null);

let nextZ = 10;
let instanceCounter = 0;

export const WindowProvider = ({ children }: { children: ReactNode }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);

  const openApp = useCallback((appId: string) => {
    const app = getApp(appId);
    if (!app) return;
    instanceCounter++;
    const id = `${appId}-${instanceCounter}`;
    nextZ++;
    // Center with slight random offset
    const x = Math.max(40, Math.round(window.innerWidth / 2 - app.defaultWidth / 2 + (Math.random() - 0.5) * 80));
    const y = Math.max(20, Math.round(window.innerHeight / 2 - app.defaultHeight / 2 - 40 + (Math.random() - 0.5) * 60));

    setWindows((prev) => [
      ...prev.map((w) => ({ ...w, focused: false })),
      {
        id,
        appId,
        x,
        y,
        width: app.defaultWidth,
        height: app.defaultHeight,
        minimized: false,
        maximized: false,
        zIndex: nextZ,
        focused: true,
      },
    ]);
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    nextZ++;
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, focused: true, zIndex: nextZ }
          : { ...w, focused: false }
      )
    );
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, minimized: true, focused: false } : w
      )
    );
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    nextZ++;
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, maximized: !w.maximized, focused: true, zIndex: nextZ }
          : { ...w, focused: false }
      )
    );
  }, []);

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  }, []);

  const snapWindow = useCallback((id: string, rect: { x: number; y: number; width: number; height: number }) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, ...rect, restore: w.restore ?? { x: w.x, y: w.y, width: w.width, height: w.height } }
          : w
      )
    );
  }, []);

  const unsnapWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id && w.restore
          ? { ...w, x, y, width: w.restore.width, height: w.restore.height, restore: undefined }
          : w
      )
    );
  }, []);

  const [peekId, setPeekId] = useState<string | null>(null);
  const [desktopPeek, setDesktopPeek] = useState(false);

  const toggleShowDesktop = useCallback(() => {
    setWindows((prev) => {
      const anyVisible = prev.some((w) => !w.minimized);
      return prev.map((w) => ({ ...w, minimized: anyVisible, focused: false }));
    });
  }, []);

  const taskbarClick = useCallback((id: string) => {
    setWindows((prev) => {
      const win = prev.find((w) => w.id === id);
      if (!win) return prev;
      if (win.minimized) {
        nextZ++;
        return prev.map((w) =>
          w.id === id
            ? { ...w, minimized: false, focused: true, zIndex: nextZ }
            : { ...w, focused: false }
        );
      }
      if (win.focused) {
        return prev.map((w) =>
          w.id === id ? { ...w, minimized: true, focused: false } : w
        );
      }
      nextZ++;
      return prev.map((w) =>
        w.id === id
          ? { ...w, focused: true, zIndex: nextZ }
          : { ...w, focused: false }
      );
    });
  }, []);

  return (
    <WindowContext.Provider
      value={{ windows, openApp, closeWindow, minimizeWindow, toggleMaximize, focusWindow, moveWindow, taskbarClick, snapWindow, unsnapWindow, peekId, setPeekId, desktopPeek, setDesktopPeek, toggleShowDesktop }}
    >
      {children}
    </WindowContext.Provider>
  );
};

const defaultContext: WindowContextType = {
  windows: [],
  openApp: () => {},
  closeWindow: () => {},
  minimizeWindow: () => {},
  toggleMaximize: () => {},
  focusWindow: () => {},
  moveWindow: () => {},
  taskbarClick: () => {},
  snapWindow: () => {},
  unsnapWindow: () => {},
  peekId: null,
  setPeekId: () => {},
  desktopPeek: false,
  setDesktopPeek: () => {},
  toggleShowDesktop: () => {},
};

export const useWindows = () => {
  const ctx = useContext(WindowContext);
  if (!ctx) {
    console.warn("useWindows called outside WindowProvider, returning defaults");
    return defaultContext;
  }
  return ctx;
};
