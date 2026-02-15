import { lazy } from "react";
import type { AppConfig } from "@/types/windows";

const Notepad = lazy(() => import("@/apps/Notepad"));
const Pictures = lazy(() => import("@/apps/Pictures"));
const AboutDemo = lazy(() => import("@/apps/AboutDemo"));
const AuthApp = lazy(() => import("@/apps/AuthApp"));
const ControlPanel = lazy(() => import("@/apps/ControlPanel"));
const Browser = lazy(() => import("@/apps/Browser"));
const Documents = lazy(() => import("@/apps/Documents"));
const VideoPlayer = lazy(() => import("@/apps/VideoPlayer"));

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
];

export const getApp = (id: string) => appRegistry.find((a) => a.id === id);
