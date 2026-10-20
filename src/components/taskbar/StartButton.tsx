import { useState, useRef, useEffect } from "react";
import { appRegistry } from "@/config/apps";
import { useWindows } from "@/contexts/WindowContext";
import startOrb from "@/assets/start-orb.png.asset.json";

const startMenuApps = appRegistry.filter((a) => a.startMenu);

const rightItems = [
  { icon: "💻", label: "Computer", appId: "computer" },
  { icon: "📂", label: "Documents", appId: "documents" },
  { icon: "⚙️", label: "Control Panel", appId: "controlpanel" },
];

const StartMenu = ({
  open,
  onClose,
  onShutdown,
}: {
  open: boolean;
  onClose: () => void;
  onShutdown?: () => void;
}) => {
  const { openApp } = useWindows();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid the click that opened the menu
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="win-start-menu absolute bottom-12 left-1 rounded-t-lg overflow-hidden flex"
      style={{ width: 380, zIndex: 9999 }}
    >
      {/* User banner */}
      <div className="flex flex-col w-[55%]">
        <div
          className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:brightness-110 transition-all"
          style={{ background: "linear-gradient(90deg, hsl(210 65% 48%), hsl(210 55% 55%))" }}
          onClick={() => { openApp("auth"); onClose(); }}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">👤</div>
          <span className="text-sm font-semibold text-white">User</span>
        </div>
        <div className="py-2 px-2 flex-1">
          {startMenuApps.map((app) => (
            <div
              key={app.id}
              className="win-menu-item"
              onClick={() => { openApp(app.id); onClose(); }}
            >
              {app.icon.startsWith("/") || app.icon.includes("/") ? (
                <img src={app.icon} alt={app.name} className="w-5 h-5 rounded object-cover" />
              ) : (
                <span className="text-lg">{app.icon}</span>
              )}
              <span>{app.name}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Right panel */}
      <div
        className="w-[45%] py-2 px-2 flex flex-col"
        style={{ background: "hsl(210 30% 90%)", borderLeft: "1px solid hsl(210 20% 82%)" }}
      >
        <div className="flex-1">
          {rightItems.map((item) => (
            <div
              key={item.label}
              className="win-menu-item"
              onClick={() => {
                if (item.appId) {
                  openApp(item.appId);
                  onClose();
                }
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-[hsl(210_15%_82%)] mt-2 pt-2">
          <div
            className="win-menu-item"
            onClick={() => { onShutdown?.(); onClose(); }}
          >
            <span className="text-lg">🔌</span>
            <span className="font-medium">Shutdown</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StartButton = ({ onShutdown }: { onShutdown?: () => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="w-12 h-11 flex items-center justify-center ml-1 shrink-0 transition-transform hover:scale-110 active:scale-95"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Start"
      >
        <img src={startOrb.url} alt="Start" className="h-11 w-auto object-contain drop-shadow-md" />
      </button>
      <StartMenu open={menuOpen} onClose={() => setMenuOpen(false)} onShutdown={onShutdown} />
    </div>
  );
};

export default StartButton;
