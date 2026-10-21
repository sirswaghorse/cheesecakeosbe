import { appRegistry } from "@/config/apps";

export interface StoreApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  type: "Web App" | "System Tool";
  estimatedMB: number;
  available: boolean;
  builtIn: boolean;
}

const builtInIds = new Set(["notepad", "pictures", "about", "browser", "videoplayer", "documents", "controlpanel", "computer", "appstore", "auth", "terminal", "taskmanager"]);
const details: Record<string, [string, string, StoreApp["type"], number]> = {
  notepad: ["A quiet place for your notes.", "Productivity", "System Tool", 1],
  pictures: ["Your uploaded images, all together.", "Creative", "System Tool", 2],
  about: ["Your system at a glance.", "System", "System Tool", 1],
  browser: ["Explore the web from your desktop.", "Internet", "Web App", 2],
  videoplayer: ["Play videos from your Documents.", "Entertainment", "System Tool", 3],
  documents: ["Your files, organized and within reach.", "Productivity", "System Tool", 2],
  controlpanel: ["Account settings and a desktop that feels like you.", "System", "System Tool", 2],
  computer: ["Keep an eye on your file storage.", "System", "System Tool", 1],
  appstore: ["Discover something new for your desktop.", "System", "System Tool", 3],
  "h-archive": ["Online 18+ archive browser", "Internet", "Web App", 1],
  "hippo-stats": ["Second Life / Kitely region stats monitor", "Utilities", "System Tool", 3],
  terminal: ["Linux-style shell with neofetch.", "Developer", "System Tool", 1],
  taskmanager: ["See open apps, end tasks, and watch performance.", "System", "System Tool", 1],
  "uni-ai": ["AI-powered assistant from Furbit", "Internet", "Web App", 1],
};

const plannedApps = [
  ["calculator", "Calculator", "🧮", "Basic & scientific calculator", "Utilities"],
  ["calendar", "Calendar", "📅", "Schedule and events manager", "Productivity"],
  ["email", "Mail", "📧", "Email client", "Communication"],
  ["maps", "Maps", "🗺️", "Explore the world", "Travel"],
  ["weather", "Weather", "🌤️", "Local weather & forecasts", "Utilities"],
  ["music-store", "Music Store", "🎵", "Browse and download music", "Entertainment"],
  ["clock", "Clock", "🕐", "World clock, alarms & timers", "Utilities"],
  ["paint", "Paint", "🎨", "Drawing and image editor", "Creative"],
  ["chat", "Messenger", "💬", "Instant messaging", "Communication"],
  ["tasks", "Tasks", "✅", "To-do list & task manager", "Productivity"],
  ["games", "Games Hub", "🎮", "Casual games collection", "Entertainment"],
  ["code-editor", "Code Editor", "📝", "Lightweight code editor", "Developer"],
  ["camera", "Camera", "📷", "Webcam capture & filters", "Creative"],
  ["podcast", "Podcasts", "🎙️", "Listen to your favorite shows", "Entertainment"],
  ["fitness", "Fitness", "💪", "Workout tracker & health stats", "Health"],
];

export const storeCatalog: StoreApp[] = [
  ...appRegistry.filter((app) => app.id !== "auth").map((app): StoreApp => {
    const [description, category, type, estimatedMB] = details[app.id] ?? [app.name, "Utilities", "System Tool", 1];
    return { id: app.id, name: app.name, icon: app.icon, description, category, type, estimatedMB, available: true, builtIn: builtInIds.has(app.id) };
  }),
  ...plannedApps.map(([id, name, icon, description, category]): StoreApp => ({ id, name, icon, description, category, type: "System Tool", estimatedMB: 0, available: false, builtIn: false })),
];

export const isDefaultApp = (id: string) => builtInIds.has(id);
export const canInstallApp = (id: string) => storeCatalog.some((app) => app.id === id && app.available && !app.builtIn);
export const filterStoreApps = (apps: StoreApp[], query: string, category: string) => {
  const search = query.trim().toLowerCase();
  return apps.filter((app) => (category === "All" || app.category === category) && [app.name, app.description, app.category, app.type].some((text) => text.toLowerCase().includes(search)));
};