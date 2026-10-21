import { useEffect, useState, type ReactNode } from "react";
import { Volume2, VolumeX, Volume1, Wifi, WifiOff, Bluetooth, Lock, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const load = <T,>(k: string, d: T): T => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
};
const usePersist = <T,>(k: string, d: T) => {
  const [v, setV] = useState<T>(() => load(k, d));
  useEffect(() => { localStorage.setItem(k, JSON.stringify(v)); }, [k, v]);
  return [v, setV] as const;
};

const panelCls = "win-glass w-72 rounded-lg border border-border/40 p-3 text-foreground z-[10000] animate-in slide-in-from-bottom-2 fade-in duration-200";

const TrayButton = ({ label, children }: { label: string; children: ReactNode }) => (
  <PopoverTrigger asChild>
    <button aria-label={label} title={label} className="h-9 w-8 flex items-center justify-center rounded text-foreground/80 hover:bg-primary/30 transition-colors">
      {children}
    </button>
  </PopoverTrigger>
);

const NETWORKS = [
  { name: "Blueberry-Home", strength: 4, secure: true },
  { name: "Cheesecake-5G", strength: 3, secure: true },
  { name: "CoffeeShop_Free", strength: 2, secure: false },
];

const DEVICES = [
  { id: "headphones", name: "Lavender Headphones", type: "🎧" },
  { id: "mouse", name: "Berry Mouse", type: "🖱️" },
  { id: "keyboard", name: "Crumb Keyboard", type: "⌨️" },
];

const VolumeFlyout = () => {
  const [volume, setVolume] = usePersist("tray-volume", 70);
  const [muted, setMuted] = usePersist("tray-muted", false);
  useEffect(() => {
    document.querySelectorAll("audio, video").forEach((el) => {
      const m = el as HTMLMediaElement; m.volume = volume / 100; m.muted = muted;
    });
  }, [volume, muted]);
  const Icon = muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  return (
    <Popover>
      <TrayButton label="Volume"><Icon className="h-4 w-4" /></TrayButton>
      <PopoverContent side="top" align="end" sideOffset={10} className={panelCls}>
        <p className="text-xs font-semibold mb-3">Speakers</p>
        <div className="flex items-center gap-3">
          <button aria-label={muted ? "Unmute" : "Mute"} onClick={() => setMuted(!muted)} className="p-1.5 rounded hover:bg-primary/30">
            <Icon className="h-5 w-5" />
          </button>
          <Slider value={[muted ? 0 : volume]} max={100} step={1} onValueChange={([v]) => { setVolume(v); if (v > 0) setMuted(false); }} className="flex-1" />
          <span className="text-xs w-8 text-right tabular-nums">{muted ? 0 : volume}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const NetworkFlyout = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [connected, setConnected] = usePersist<string | null>("tray-network", "Blueberry-Home");
  useEffect(() => {
    const up = () => setOnline(true), down = () => setOnline(false);
    window.addEventListener("online", up); window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);
  const ok = online && connected;
  return (
    <Popover>
      <TrayButton label="Network">{ok ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}</TrayButton>
      <PopoverContent side="top" align="end" sideOffset={10} className={panelCls}>
        <p className="text-xs font-semibold">Wireless networks</p>
        <p className="text-[11px] text-foreground/60 mb-2">{!online ? "Your device is offline" : connected ? `Connected to ${connected}` : "Not connected"}</p>
        <div className="space-y-1">
          {NETWORKS.map((n) => {
            const isOn = connected === n.name;
            return (
              <button key={n.name} onClick={() => setConnected(isOn ? null : n.name)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded text-left text-xs transition-colors ${isOn ? "bg-primary/40" : "hover:bg-primary/25"}`}>
                <Wifi className="h-4 w-4" style={{ opacity: 0.4 + n.strength * 0.15 }} />
                <span className="flex-1 truncate">{n.name}</span>
                {n.secure && <Lock className="h-3 w-3 opacity-60" />}
                <span className="text-[10px] opacity-80">{isOn ? "Disconnect" : "Connect"}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const BluetoothFlyout = () => {
  const [enabled, setEnabled] = usePersist("tray-bt-on", true);
  const [paired, setPaired] = usePersist<string[]>("tray-bt-devices", []);
  const [busy, setBusy] = useState<string | null>(null);
  const toggle = (id: string) => {
    setBusy(id);
    setTimeout(() => {
      setPaired((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
      setBusy(null);
    }, 900);
  };
  return (
    <Popover>
      <TrayButton label="Bluetooth"><Bluetooth className={`h-4 w-4 ${enabled ? "" : "opacity-40"}`} /></TrayButton>
      <PopoverContent side="top" align="end" sideOffset={10} className={panelCls}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold">Bluetooth</p>
          <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Toggle Bluetooth" />
        </div>
        {!enabled ? (
          <p className="text-[11px] text-foreground/60">Bluetooth is off.</p>
        ) : (
          <div className="space-y-1">
            {DEVICES.map((d) => {
              const on = paired.includes(d.id);
              return (
                <button key={d.id} disabled={busy === d.id} onClick={() => toggle(d.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded text-left text-xs transition-colors ${on ? "bg-primary/40" : "hover:bg-primary/25"}`}>
                  <span>{d.type}</span>
                  <span className="flex-1 truncate">{d.name}</span>
                  {on && <Check className="h-3 w-3" />}
                  <span className="text-[10px] opacity-80">{busy === d.id ? "Working…" : on ? "Disconnect" : "Connect"}</span>
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

const SystemTray = () => (
  <div className="flex items-center">
    <BluetoothFlyout />
    <NetworkFlyout />
    <VolumeFlyout />
  </div>
);

export default SystemTray;
