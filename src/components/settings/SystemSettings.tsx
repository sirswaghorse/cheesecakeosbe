import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, Monitor, Settings2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useSystemPreferences } from "@/lib/systemSettings";

export function SystemSettings() {
  const { preferences, update } = useSystemPreferences();
  const [name, setName] = useState(preferences.deviceName);
  const [message, setMessage] = useState("");
  return <div className="space-y-5">
    <div className="flex items-center gap-3"><Settings2 className="size-8 text-primary" /><div><h2 className="text-lg font-semibold">Cheesecake OS</h2><p className="text-xs text-muted-foreground">Blueberry Edition · Browser desktop</p></div></div>
    <dl className="divide-y text-xs">
      {[['Environment', 'Web application'], ['Linux integration', 'Not connected'], ['Kernel & hardware', 'Available after Linux integration'], ['Browser language', navigator.language]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">{label}</dt><dd className="text-right">{value}</dd></div>)}
    </dl>
    <form onSubmit={e => { e.preventDefault(); const ok = update({ deviceName: name }); setMessage(ok ? "Desktop name saved on this device. This does not change your computer’s hostname." : "Could not save your desktop name."); }} className="space-y-2 border-t pt-4">
      <label htmlFor="desktop-name" className="text-xs font-semibold">Desktop name</label>
      <div className="flex gap-2"><Input id="desktop-name" value={name} onChange={e => setName(e.target.value)} maxLength={64} required className="min-w-0" /><Button size="sm" type="submit">Save</Button></div>
    </form>
    <div className="border-t pt-4 text-xs space-y-2"><h3 className="font-semibold">Linux system controls</h3><p className="text-muted-foreground">Power management, drivers, hardware, and computer hostname settings require the future Linux integration.</p></div>
    {message && <p role="status" className="text-xs text-primary">{message}</p>}
  </div>;
}

export function UpdateSettings() {
  const { preferences, update } = useSystemPreferences();
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState("");
  const save = (patch: Parameters<typeof update>[0]) => setMessage(update(patch) ? "Preference saved on this device. Linux updates are not active yet." : "Could not save this preference.");
  return <div className="space-y-5">
    <div className="flex gap-3 items-center"><ShieldCheck className="size-8 text-primary" /><div><h2 className="text-lg font-semibold">Cheesecake Update</h2><p className="text-xs text-muted-foreground">Update preferences</p></div></div>
    <div className="border-y py-4 space-y-3"><p className="text-sm font-semibold">Linux update service not connected</p><p className="text-xs text-muted-foreground">This browser desktop receives published website changes. It cannot check for or install Linux system updates.</p><Button size="sm" onClick={() => setChecked(true)}><RefreshCw />Check for updates</Button>
      {checked && <p role="status" className="text-xs text-primary">Checked availability: no Linux update service is connected. No updates were downloaded or installed.</p>}
    </div>
    <div className="flex items-center justify-between gap-4"><div><label htmlFor="auto-updates" className="text-sm font-medium">Automatic updates</label><p className="text-xs text-muted-foreground mt-1">Saved preference · inactive until Linux is connected</p></div><Switch id="auto-updates" checked={preferences.automaticUpdates} onCheckedChange={value => save({ automaticUpdates: value })} /></div>
    <fieldset className="space-y-2 border-t pt-4"><legend className="text-xs font-semibold pt-4">Update channel</legend>
      {([['stable', 'Stable', 'Regular releases'], ['testing', 'Testing', 'Preview releases · may be less reliable']] as const).map(([value, label, detail]) => <label key={value} className="flex items-center gap-3 py-2 text-sm"><input type="radio" name="update-channel" value={value} checked={preferences.updateChannel === value} onChange={() => save({ updateChannel: value })} /><span>{label}<span className="block text-xs text-muted-foreground">{detail}</span></span></label>)}
    </fieldset>
    {message && <p role="status" className="text-xs text-primary flex gap-2"><CheckCircle2 className="size-4 shrink-0" />{message}</p>}
  </div>;
}

interface DisplayInfo { label?: string; width: number; height: number; left?: number; top?: number; isPrimary?: boolean }
type DisplayWindow = Window & { getScreenDetails?: () => Promise<{ screens: DisplayInfo[] }> };
export function DisplaySettings() {
  const [screens, setScreens] = useState<DisplayInfo[]>([{ width: window.screen.width, height: window.screen.height, label: "Current display" }]);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight, ratio: window.devicePixelRatio });
  useEffect(() => {
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight, ratio: window.devicePixelRatio });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const [message, setMessage] = useState("");
  const detect = async () => {
    const win = window as DisplayWindow;
    if (!win.getScreenDetails) { setMessage("This browser cannot list connected monitors. Use your computer’s display settings."); return; }
    try { const details = await win.getScreenDetails(); setScreens(details.screens); setMessage(`${details.screens.length} display(s) detected. Arrangement changes require your computer’s settings.`); }
    catch { setMessage("Display access was not granted. You can allow it in your browser’s site permissions."); }
  };
  return <div className="space-y-5">
    <div className="flex items-center gap-3"><Monitor className="size-8 text-primary" /><div><h2 className="text-lg font-semibold">Display & Monitors</h2><p className="text-xs text-muted-foreground">Connected displays & projection</p></div></div>
    <div className="flex flex-wrap justify-center gap-3 bg-secondary py-5 px-3 rounded-md" aria-label="Detected displays">{screens.map((screen, i) => <div key={i} className="w-36 text-center"><div className="aspect-video border-2 border-primary bg-primary/10 flex items-center justify-center rounded text-3xl font-semibold text-primary">{i + 1}</div><p className="text-xs mt-2">{screen.label || `Display ${i + 1}`}{screen.isPrimary ? ' · Primary' : ''}</p><p className="text-xs text-muted-foreground">{screen.width} × {screen.height}</p></div>)}</div>
    <Button variant="outline" size="sm" onClick={detect}><RefreshCw />Detect displays</Button>
    <dl className="divide-y text-xs"><div className="flex justify-between py-3"><dt>Desktop viewport</dt><dd>{viewport.width} × {viewport.height}</dd></div><div className="flex justify-between py-3"><dt>Device pixel ratio</dt><dd>{viewport.ratio}</dd></div></dl>
    <div className="space-y-3 border-t pt-4"><h3 className="text-sm font-semibold">Monitor configuration</h3><p className="text-xs text-muted-foreground">Monitor arrangement, resolution, refresh rate, scaling, and Extend / Duplicate modes are controlled by your computer, not this website.</p><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled>Arrange monitors</Button><Button size="sm" variant="outline" disabled>Resolution & scaling</Button></div></div>
    <ProjectionControls />
    {message && <p role="status" className="text-xs text-primary">{message}</p>}
  </div>;
}

export function ProjectionControls() {
  const [message, setMessage] = useState("");
  const fullscreen = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { setMessage("Full screen is not available in this browser or embedded preview."); }
  };
  return <div className="space-y-3 border-t pt-4"><h3 className="text-sm font-semibold">Project / Cast</h3><p className="text-xs text-muted-foreground">To cast this desktop to a compatible device, open your browser’s menu and choose Cast (if available). Device discovery and connection are handled by the browser.</p><p className="text-xs text-muted-foreground">For a second monitor, move this browser window onto that display using your computer’s display settings.</p><Button size="sm" variant="outline" disabled={!document.fullscreenEnabled} onClick={fullscreen}><Monitor />Toggle full screen</Button>{message && <p role="status" className="text-xs text-primary">{message}</p>}</div>;
}