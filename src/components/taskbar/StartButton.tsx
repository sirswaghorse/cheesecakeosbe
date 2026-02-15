import { useState, useRef, useEffect } from "react";
import { appRegistry } from "@/config/apps";
import { useWindows } from "@/contexts/WindowContext";

const startMenuApps = appRegistry.filter((a) => a.startMenu);

const rightItems = [
  { icon: "💻", label: "Computer" },
  { icon: "📂", label: "Documents" },
  { icon: "⚙️", label: "Control Panel" },
  { icon: "🔌", label: "Shutdown" },
];

const StartMenu = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
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
          className="px-4 py-3 flex items-center gap-3"
          style={{ background: "linear-gradient(90deg, hsl(210 65% 48%), hsl(210 55% 55%))" }}
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
              <span className="text-lg">{app.icon}</span>
              <span>{app.name}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Right panel */}
      <div
        className="w-[45%] py-2 px-2"
        style={{ background: "hsl(210 30% 90%)", borderLeft: "1px solid hsl(210 20% 82%)" }}
      >
        {rightItems.map((item) => (
          <div key={item.label} className="win-menu-item">
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StartButton = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="win-start-btn w-12 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ml-1 shrink-0"
        onClick={() => setMenuOpen((v) => !v)}
      >
        ⊞
      </button>
      <StartMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

export default StartButton;
