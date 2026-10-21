import { useMemo, useState } from "react";
import { ArrowUpRight, Check, Download, Search, ShoppingBag, Trash2 } from "lucide-react";
import storeIcon from "@/assets/cheesecake-store-icon.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInstalledApps } from "@/contexts/InstalledAppsContext";
import { useWindows } from "@/contexts/WindowContext";
import { filterStoreApps, isDefaultApp, storeCatalog, type StoreApp } from "@/config/storeCatalog";

const AppIcon = ({ app, large = false }: { app: Pick<StoreApp, "name" | "icon">; large?: boolean }) => (
  app.icon.includes("/")
    ? <img src={app.icon} alt="" loading="lazy" width={large ? 88 : 44} height={large ? 88 : 44} className={`${large ? "h-[88px] w-[88px]" : "h-11 w-11"} shrink-0 rounded-md object-contain`} />
    : <span aria-hidden="true" className={`${large ? "text-6xl" : "text-4xl"} flex h-11 w-11 shrink-0 items-center justify-center`}>{app.icon}</span>
);

const AppStore = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState("discover");
  const { installedAppIds, installApp, uninstallApp } = useInstalledApps();
  const { openApp } = useWindows();
  const installed = useMemo(() => storeCatalog.filter((app) => app.builtIn || installedAppIds.has(app.id)), [installedAppIds]);
  const categories = ["All", ...Array.from(new Set(storeCatalog.filter((app) => !app.builtIn).map((app) => app.category))).sort()];
  const discoverApps = filterStoreApps(storeCatalog.filter((app) => !app.builtIn), search, category);
  const installedApps = filterStoreApps(installed, search, category);
  const featured = storeCatalog.find((app) => app.id === "uni-ai");
  const estimate = installed.reduce((sum, app) => sum + app.estimatedMB, 0);

  const action = (app: StoreApp, management = false) => {
    const present = app.builtIn || installedAppIds.has(app.id);
    if (!app.available) return <span className="text-xs text-muted-foreground">Coming soon</span>;
    if (present) return (
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="secondary" size="sm" className="h-8 text-xs" onClick={() => openApp(app.id)} aria-label={`Open ${app.name}`}><ArrowUpRight />Open</Button>
        {management && !isDefaultApp(app.id) && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title={`Uninstall ${app.name}`} aria-label={`Uninstall ${app.name}`} onClick={() => uninstallApp(app.id)}><Trash2 /></Button>}
      </div>
    );
    return <Button size="sm" className="h-8 text-xs" onClick={() => installApp(app.id)} aria-label={`Install ${app.name}`}><Download />Install</Button>;
  };

  const card = (app: StoreApp, management = false) => (
    <article key={app.id} aria-label={app.name} className="rounded-lg border border-border bg-card p-3 text-card-foreground">
      <div className="flex items-start gap-3">
        <AppIcon app={app} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-5">{app.name}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{app.description}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="rounded-sm bg-muted px-1.5 py-0.5">{app.type}</span>
          <span>{app.category}</span>
        </div>
        {action(app, management)}
      </div>
      {management && <div className="mt-3 flex flex-wrap items-center justify-between gap-1 border-t border-border pt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><Check size={12} />{app.builtIn ? "Default System App" : "Installed"}</span>
        <span>{app.estimatedMB ? `${app.estimatedMB} MB estimated` : "Size unavailable"}</span>
      </div>}
    </article>
  );

  return (
    <div className="cheesecake-store flex h-full min-h-0 flex-col bg-background text-foreground">
      <header className="shrink-0 border-b border-border px-4 pb-3 pt-4">
        <div className="mb-3 flex items-center gap-3">
          <img src={storeIcon} alt="" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" />
          <div className="min-w-0"><h1 className="text-lg font-semibold leading-6">Cheesecake App Store</h1><p className="text-xs text-muted-foreground">Blueberry Edition</p></div>
        </div>
        <div className="relative"><Search aria-hidden="true" size={16} className="absolute left-3 top-2.5 text-muted-foreground" /><Input aria-label="Search apps" placeholder="Search apps, categories…" value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 bg-card pl-9 text-sm text-foreground placeholder:text-muted-foreground" /></div>
      </header>
      <Tabs value={tab} onValueChange={(value) => { setTab(value); setCategory("All"); }} className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 px-4 pt-3"><TabsList className="h-9"><TabsTrigger value="discover" className="gap-2 text-xs"><ShoppingBag size={14} />Discover</TabsTrigger><TabsTrigger value="installed" className="gap-2 text-xs"><Check size={14} />Installed <span className="text-muted-foreground">{installed.length}</span></TabsTrigger></TabsList></div>
        <div className="flex shrink-0 gap-1 overflow-x-auto px-4 py-3" aria-label="App categories">
          {(tab === "installed" ? ["All", ...Array.from(new Set(installed.map((app) => app.category))).sort()] : categories).map((item) => <Button key={item} variant={category === item ? "secondary" : "ghost"} size="sm" className="h-7 shrink-0 px-2 text-xs" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</Button>)}
        </div>
        <TabsContent value="discover" className="m-0 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {!search && category === "All" && featured && <section className="store-spotlight mb-5 flex items-center gap-4 border-y border-border p-4">
            <AppIcon app={featured} large />
            <div className="min-w-0 flex-1"><p className="mb-1 text-[10px] font-semibold uppercase text-primary">Featured app</p><h2 className="text-xl font-semibold">Uni AI</h2><p className="mb-3 mt-1 text-xs leading-5 text-muted-foreground">Your Furbit assistant, a little closer.</p>{action(featured)}</div>
          </section>}
          <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">{search ? "Search results" : category === "All" ? "For your desktop" : category}</h2><span className="text-xs text-muted-foreground">{discoverApps.length} apps</span></div>
          <div className="store-app-grid">{discoverApps.map((app) => card(app))}</div>
          {!discoverApps.length && <p className="py-10 text-center text-sm text-muted-foreground">No apps found.</p>}
        </TabsContent>
        <TabsContent value="installed" className="m-0 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-y border-border py-3"><h2 className="text-sm font-semibold">Your apps</h2><span className="text-xs text-muted-foreground">{estimate} MB · simulated total</span></div>
          <div className="store-app-grid">{installedApps.map((app) => card(app, true))}</div>
          {!installedApps.length && <p className="py-10 text-center text-sm text-muted-foreground">No installed apps found.</p>}
          <p className="mt-4 text-[10px] text-muted-foreground">App sizes are estimates, not account storage usage.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default AppStore;
