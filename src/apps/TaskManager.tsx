import { useEffect, useMemo, useState } from "react";
import { useWindows } from "@/contexts/WindowContext";
import { getApp } from "@/config/apps";
import mascot from "@/assets/cheesecake-blueberry.png";

const bootTime = Date.now();
const HISTORY = 40;

const seed = (id: string) => [...id].reduce((a, c) => a + c.charCodeAt(0), 0);

const Graph = ({ data, label, value }: { data: number[]; label: string; value: string }) => {
  const points = data.map((v, i) => `${(i / (HISTORY - 1)) * 100},${100 - v}`).join(" ");
  return (
    <div className="rounded-md border border-primary/30 bg-foreground/90 p-2">
      <div className="mb-1 flex justify-between text-xs text-background">
        <span>{label}</span><span className="font-mono">{value}</span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-20 w-full">
        {[25, 50, 75].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} className="stroke-primary/20" strokeWidth="0.5" />)}
        <polygon points={`0,100 ${points} 100,100`} className="fill-primary/25" />
        <polyline points={points} fill="none" className="stroke-primary" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

const fmtUptime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s % 60).padStart(2, "0")}s`;
};

const TaskManager = () => {
  const { windows, closeWindow, focusWindow } = useWindows();
  const [tab, setTab] = useState<"apps" | "perf" | "info">("apps");
  const [tick, setTick] = useState(0);
  const [cpu, setCpu] = useState<number[]>(Array(HISTORY).fill(5));
  const [ram, setRam] = useState<number[]>(Array(HISTORY).fill(20));
  const [net, setNet] = useState<number[]>(Array(HISTORY).fill(2));
  const [selected, setSelected] = useState<string | null>(null);

  const load = windows.length;
  useEffect(() => {
    const t = setInterval(() => {
      setTick((n) => n + 1);
      const push = (arr: number[], v: number) => [...arr.slice(1), Math.max(1, Math.min(99, v))];
      setCpu((a) => push(a, 4 + load * 7 + Math.random() * 15));
      setRam((a) => push(a, 18 + load * 6 + Math.random() * 3));
      setNet((a) => push(a, Math.random() * (10 + load * 5)));
    }, 1000);
    return () => clearInterval(t);
  }, [load]);

  const procs = useMemo(() => windows.map((w) => {
    const app = getApp(w.appId);
    const s = seed(w.id);
    return {
      id: w.id, name: app?.name ?? w.appId, icon: app?.icon ?? "🗔",
      status: w.minimized ? "Minimized" : "Running",
      cpu: ((s + tick * 7) % 9) + (w.focused ? 3 : 0),
      mem: 30 + (s % 120),
    };
  }), [windows, tick]);

  const ramGb = ((ram[HISTORY - 1] / 100) * 8).toFixed(1);
  const tabs = [["apps", "Applications"], ["perf", "Performance"], ["info", "System"]] as const;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-accent to-background text-sm text-foreground">
      <div className="flex gap-1 border-b border-primary/20 px-2 pt-2">
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`rounded-t-md px-3 py-1 ${tab === id ? "bg-background font-semibold text-primary shadow" : "text-muted-foreground hover:bg-background/60"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-3 pb-32">
        {tab === "apps" && (
          <div className="rounded-md border border-primary/20 bg-background/80">
            <div className="grid grid-cols-[1fr_80px_50px_70px] gap-2 border-b border-primary/20 px-2 py-1 text-xs font-semibold text-muted-foreground">
              <span>Task</span><span>Status</span><span>CPU</span><span>Memory</span>
            </div>
            {procs.length === 0 && <p className="p-3 text-muted-foreground">No apps are open.</p>}
            {procs.map((p) => (
              <button key={p.id} onClick={() => setSelected(p.id)} onDoubleClick={() => focusWindow(p.id)}
                className={`grid w-full grid-cols-[1fr_80px_50px_70px] items-center gap-2 px-2 py-1 text-left ${selected === p.id ? "bg-primary/20" : "hover:bg-primary/10"}`}>
                <span className="flex items-center gap-2 truncate">
                  {p.icon.length > 4 ? <img src={p.icon} alt="" className="h-4 w-4 object-contain" /> : <span>{p.icon}</span>}
                  {p.name}
                </span>
                <span className="text-xs">{p.status}</span>
                <span className="font-mono text-xs">{p.cpu}%</span>
                <span className="font-mono text-xs">{p.mem} MB</span>
              </button>
            ))}
            <div className="flex justify-end gap-2 border-t border-primary/20 p-2">
              <button disabled={!selected} onClick={() => selected && focusWindow(selected)}
                className="rounded border border-primary/30 px-3 py-1 disabled:opacity-40 hover:bg-primary/10">Switch To</button>
              <button disabled={!selected} onClick={() => { if (selected) { closeWindow(selected); setSelected(null); } }}
                className="rounded bg-primary px-3 py-1 text-primary-foreground disabled:opacity-40 hover:opacity-90">End Task</button>
            </div>
          </div>
        )}

        {tab === "perf" && (
          <div className="grid gap-2 sm:grid-cols-2">
            <Graph data={cpu} label="CPU Usage" value={`${Math.round(cpu[HISTORY - 1])}%`} />
            <Graph data={ram} label="Memory" value={`${ramGb} / 8.0 GB`} />
            <Graph data={net} label="Network" value={`${(net[HISTORY - 1] / 10).toFixed(1)} Mbps`} />
            <div className="rounded-md border border-primary/30 bg-background/80 p-3 text-xs">
              <p><b>Uptime:</b> {fmtUptime(Date.now() - bootTime)}</p>
              <p><b>Open windows:</b> {windows.length}</p>
              <p className="mt-2 text-muted-foreground">Figures are simulated in the browser.</p>
            </div>
          </div>
        )}

        {tab === "info" && (
          <div className="space-y-1 rounded-md border border-primary/20 bg-background/80 p-3 text-xs">
            <p className="text-base font-bold text-primary">Cheesecake OS: Blueberry Edition</p>
            <p><b>Build:</b> 2026.10 (web preview)</p>
            <p><b>Kernel:</b> 6.8.0-blueberry (simulated)</p>
            <p><b>Architecture:</b> x86_64</p>
            <p><b>Browser:</b> {navigator.userAgent.split(" ").slice(-1)[0]}</p>
            <p><b>Logical cores:</b> {navigator.hardwareConcurrency ?? "?"}</p>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-28 items-end justify-center bg-gradient-to-t from-primary/25 to-transparent">
        <img src={mascot} alt="Cheesecake mascot" className="h-28 w-auto object-contain object-bottom mix-blend-multiply" />
      </div>
    </div>
  );
};

export default TaskManager;
