import { lazy } from "react";
import type { AppConfig } from "@/types/windows";
import hippoIcon from "@/assets/hippo-stats-icon.png";
import uniIcon from "@/assets/uni-ai-icon.png";
import storeIcon from "@/assets/cheesecake-store-icon.png";

const Notepad = lazy(() => import("@/apps/Notepad"));
const Pictures = lazy(() => import("@/apps/Pictures"));
const AboutDemo = lazy(() => import("@/apps/AboutDemo"));
const AuthApp = lazy(() => import("@/apps/AuthApp"));
const ControlPanel = lazy(() => import("@/apps/ControlPanel"));
const Browser = lazy(() => import("@/apps/Browser"));
const Documents = lazy(() => import("@/apps/Documents"));
const VideoPlayer = lazy(() => import("@/apps/VideoPlayer"));
const AppStore = lazy(() => import("@/apps/AppStore"));
const HArchive = lazy(() => import("@/apps/HArchive"));
const Computer = lazy(() => import("@/apps/Computer"));
const HippoStats = lazy(() => import("@/apps/HippoStats"));
const UniAI = lazy(() => import("@/apps/UniAI"));
const Terminal = lazy(() => import("@/apps/Terminal"));

export const appRegistry: AppConfig[] = [
  {
    id: "notepad",
    name: "Notepad",
    icon: "📝",
    defaultWidth: 500,
    defaultHeight: 400,
    component: Notepad,
    desktopIcon: true,
    startMenu: true,
  },
  {
    id: "pictures",
    name: "Pictures",
    icon: "🖼️",
    defaultWidth: 480,
    defaultHeight: 420,
    component: Pictures,
    desktopIcon: true,
    startMenu: true,
  },
  {
    id: "about",
    name: "About This Demo",
    icon: "ℹ️",
    defaultWidth: 380,
    defaultHeight: 360,
    component: AboutDemo,
    desktopIcon: true,
    startMenu: true,
  },
  {
    id: "auth",
    name: "User Account",
    icon: "👤",
    defaultWidth: 340,
    defaultHeight: 380,
    component: AuthApp,
    desktopIcon: false,
    startMenu: false,
  },
  {
    id: "controlpanel",
    name: "Control Panel",
    icon: "⚙️",
    defaultWidth: 450,
    defaultHeight: 420,
    component: ControlPanel,
    desktopIcon: false,
    startMenu: false,
  },
  {
    id: "browser",
    name: "Internet",
    icon: "🌐",
    defaultWidth: 800,
    defaultHeight: 550,
    component: Browser,
    desktopIcon: true,
    startMenu: true,
  },
  {
    id: "documents",
    name: "Documents",
    icon: "📂",
    defaultWidth: 600,
    defaultHeight: 450,
    component: Documents,
    desktopIcon: false,
    startMenu: true,
  },
  {
    id: "videoplayer",
    name: "Video Player",
    icon: "🎬",
    defaultWidth: 640,
    defaultHeight: 480,
    component: VideoPlayer,
    desktopIcon: true,
    startMenu: true,
  },
  {
    id: "appstore",
    name: "Cheesecake App Store",
    icon: storeIcon,
    defaultWidth: 780,
    defaultHeight: 650,
    component: AppStore,
    desktopIcon: true,
    startMenu: true,
  },
  {
    id: "h-archive",
    name: "H Archive",
    icon: "❤️",
    defaultWidth: 800,
    defaultHeight: 550,
    component: HArchive,
    desktopIcon: false,
    startMenu: false,
  },
  {
    id: "computer",
    name: "Computer",
    icon: "💻",
    defaultWidth: 420,
    defaultHeight: 480,
    component: Computer,
    desktopIcon: false,
    startMenu: false,
  },
  {
    id: "hippo-stats",
    name: "Hippo Stats",
    icon: hippoIcon,
    defaultWidth: 480,
    defaultHeight: 520,
    component: HippoStats,
    desktopIcon: false,
    startMenu: false,
  },
  {
    id: "uni-ai",
    name: "Uni AI",
    icon: uniIcon,
    defaultWidth: 800,
    defaultHeight: 550,
    component: UniAI,
    desktopIcon: false,
    startMenu: false,
  },
  {
    id: "terminal",
    name: "Terminal",
    icon: "⌨️",
    defaultWidth: 620,
    defaultHeight: 400,
    component: Terminal,
    desktopIcon: true,
    startMenu: true,
  },
];

export const getApp = (id: string) => appRegistry.find((a) => a.id === id);
