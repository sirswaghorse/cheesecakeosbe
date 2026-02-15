import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInstalledApps } from "@/contexts/InstalledAppsContext";

interface StoreApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

const AVAILABLE_APPS: StoreApp[] = [
  { id: "calculator", name: "Calculator", icon: "🧮", description: "Basic & scientific calculator", category: "Utilities" },
  { id: "terminal", name: "Terminal", icon: "💻", description: "Command-line interface", category: "Developer" },
  { id: "calendar", name: "Calendar", icon: "📅", description: "Schedule and events manager", category: "Productivity" },
  { id: "email", name: "Mail", icon: "📧", description: "Email client", category: "Communication" },
  { id: "maps", name: "Maps", icon: "🗺️", description: "Explore the world", category: "Travel" },
  { id: "weather", name: "Weather", icon: "🌤️", description: "Local weather & forecasts", category: "Utilities" },
  { id: "music-store", name: "Music Store", icon: "🎵", description: "Browse and download music", category: "Entertainment" },
  { id: "clock", name: "Clock", icon: "🕐", description: "World clock, alarms & timers", category: "Utilities" },
  { id: "paint", name: "Paint", icon: "🎨", description: "Drawing and image editor", category: "Creative" },
  { id: "chat", name: "Messenger", icon: "💬", description: "Instant messaging", category: "Communication" },
  { id: "tasks", name: "Tasks", icon: "✅", description: "To-do list & task manager", category: "Productivity" },
  { id: "games", name: "Games Hub", icon: "🎮", description: "Casual games collection", category: "Entertainment" },
  { id: "code-editor", name: "Code Editor", icon: "📝", description: "Lightweight code editor with syntax highlighting", category: "Developer" },
  { id: "camera", name: "Camera", icon: "📷", description: "Webcam capture & filters", category: "Creative" },
  { id: "podcast", name: "Podcasts", icon: "🎙️", description: "Listen to your favorite shows", category: "Entertainment" },
  { id: "fitness", name: "Fitness", icon: "💪", description: "Workout tracker & health stats", category: "Health" },
  { id: "h-archive", name: "H Archive", icon: "❤️", description: "Online archive browser", category: "Internet" },
];

const INSTALLED_IDS = ["notepad", "pictures", "about", "browser", "videoplayer", "documents"];

const INSTALLED_APPS: StoreApp[] = [
  { id: "notepad", name: "Notepad", icon: "📝", description: "Simple text editor", category: "Utilities" },
  { id: "pictures", name: "Pictures", icon: "🖼️", description: "Image viewer & gallery", category: "Creative" },
  { id: "about", name: "About This Demo", icon: "ℹ️", description: "System information", category: "System" },
  { id: "browser", name: "Internet", icon: "🌐", description: "Web browser", category: "Internet" },
  { id: "videoplayer", name: "Video Player", icon: "🎬", description: "Media playback", category: "Entertainment" },
  { id: "documents", name: "Documents", icon: "📂", description: "File manager", category: "Productivity" },
];

const AppCard = ({ app, installed, isDefault, onAction }: { app: StoreApp; installed: boolean; isDefault: boolean; onAction: () => void }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(220_14%_92%)] transition-colors">
    <span className="text-3xl shrink-0">{app.icon}</span>
    <div className="flex-1 min-w-0">
      <div className="font-medium text-sm text-[hsl(220_10%_20%)] truncate">{app.name}</div>
      <div className="text-xs text-[hsl(210_10%_50%)] truncate">{app.description}</div>
      <div className="text-[10px] text-[hsl(210_10%_60%)] mt-0.5">{app.category}</div>
    </div>
    {installed && isDefault ? (
      <span className="shrink-0 text-[10px] text-[hsl(210_10%_55%)] px-2">Default</span>
    ) : (
      <Button
        size="sm"
        variant={installed ? "destructive" : "default"}
        className="shrink-0 text-xs h-7 px-3"
        onClick={onAction}
      >
        {installed ? "Uninstall" : "Get"}
      </Button>
    )}
  </div>
);

const AppStore = () => {
  const [search, setSearch] = useState("");
  const [installed, setInstalled] = useState<Set<string>>(new Set(INSTALLED_IDS));
  const { installApp, uninstallApp } = useInstalledApps();

  const filteredStore = useMemo(() => {
    const q = search.toLowerCase();
    return AVAILABLE_APPS.filter(
      (a) => !installed.has(a.id) && (a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))
    );
  }, [search, installed]);

  const installedList = useMemo(() => {
    return [...INSTALLED_APPS, ...AVAILABLE_APPS.filter((a) => installed.has(a.id) && !INSTALLED_IDS.includes(a.id))];
  }, [installed]);

  const handleInstall = (id: string) => {
    setInstalled((prev) => new Set(prev).add(id));
    installApp(id);
  };

  const handleUninstall = (id: string) => {
    setInstalled((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    uninstallApp(id);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(220 14% 96%)" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🏪</span>
          <h1 className="text-lg font-bold text-[hsl(220_10%_20%)]">HS Apps</h1>
        </div>
        <Input
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      <Tabs defaultValue="discover" className="flex-1 flex flex-col px-4 pb-2">
        <TabsList className="w-full h-8">
          <TabsTrigger value="discover" className="flex-1 text-xs h-6">Discover</TabsTrigger>
          <TabsTrigger value="installed" className="flex-1 text-xs h-6">Installed ({installedList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="flex-1 mt-2 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-1 pr-2">
              {filteredStore.length === 0 ? (
                <div className="text-center text-sm text-[hsl(210_10%_50%)] py-8">
                  {search ? "No apps match your search" : "You've installed everything! 🎉"}
                </div>
              ) : (
                filteredStore.map((app) => (
                  <AppCard key={app.id} app={app} installed={false} isDefault={false} onAction={() => handleInstall(app.id)} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="installed" className="flex-1 mt-2 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-1 pr-2">
              {installedList.map((app) => (
                <AppCard key={app.id} app={app} installed={true} isDefault={INSTALLED_IDS.includes(app.id)} onAction={() => handleUninstall(app.id)} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppStore;
