import { useState, useRef, useEffect } from "react";
import { appRegistry } from "@/config/apps";
import { useWindows } from "@/contexts/WindowContext";
import { useLocalUser } from "@/lib/localUser";
import { openSettingsSection } from "@/lib/systemSettings";
import startOrb from "@/assets/start-orb.png";

const startMenuApps = appRegistry.filter((a) => a.startMenu);

const searchableApps = appRegistry.filter((a) => a.id !== "auth");

const rightItems = [
  { icon: "💻", label: "Computer", appId: "computer" },
  { icon: "📂", label: "Documents", appId: "documents" },
  { icon: "⚙️", label: "Control Panel", appId: "controlpanel" },
];

const renderIcon = (app: { icon: string; name: string }) =>
  app.icon.startsWith("/") || app.icon.includes("/") ? (
    <img src={app.icon} alt={app.name} className="w-5 h-5 rounded object-cover" />
  ) : (
    <span className="text-lg">{app.icon}</span>
  );

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
  const localUser = useLocalUser();
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const results = query.trim()
    ? searchableApps.filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setHighlight(0);
    const focusTimer = setTimeout(() => searchRef.current?.focus(), 20);
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid the click that opened the menu
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => {
      clearTimeout(timer);
      clearTimeout(focusTimer);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  if (!open) return null;

  const launch = (appId: string) => {
    openApp(appId);
    onClose();
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlight]) launch(results[highlight].id);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

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
          onClick={() => { openSettingsSection("account"); openApp("controlpanel"); onClose(); }}
          title="Manage your user account"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">👤</div>
          <span className="text-sm font-semibold text-white truncate">{localUser.displayName}</span>
        </div>
        <div className="py-2 px-2 flex-1 overflow-auto">
          {query.trim() ? (
            results.length > 0 ? (
              results.map((app, i) => (
                <div
                  key={app.id}
                  className="win-menu-item"
                  style={i === highlight ? { background: "hsl(210 60% 50% / 0.25)", outline: "1px solid hsl(210 60% 55% / 0.6)" } : undefined}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => launch(app.id)}
                >
                  {renderIcon(app)}
                  <span>{app.name}</span>
                </div>
              ))
            ) : (
              <p className="px-2 py-3 text-xs" style={{ color: "hsl(210 15% 45%)" }}>
                No apps match "{query.trim()}"
              </p>
            )
          ) : (
            startMenuApps.map((app) => (
              <div
                key={app.id}
                className="win-menu-item"
                onClick={() => launch(app.id)}
              >
                {renderIcon(app)}
                <span>{app.name}</span>
              </div>
            ))
          )}
        </div>
        {/* Search bar */}
        <div className="px-2 pb-2">
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search apps..."
            className="w-full px-2 py-1.5 text-xs rounded border outline-none"
            style={{
              background: "white",
              borderColor: "hsl(210 30% 75%)",
              color: "hsl(210 20% 20%)",
            }}
          />
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
        <img src={startOrb} alt="Start" className="h-11 w-auto object-contain drop-shadow-md" />
      </button>
      <StartMenu open={menuOpen} onClose={() => setMenuOpen(false)} onShutdown={onShutdown} />
    </div>
  );
};

export default StartButton;
