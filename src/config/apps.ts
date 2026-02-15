import { lazy } from "react";
import type { AppConfig } from "@/types/windows";

const Notepad = lazy(() => import("@/apps/Notepad"));
const Pictures = lazy(() => import("@/apps/Pictures"));
const AboutDemo = lazy(() => import("@/apps/AboutDemo"));

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
];

export const getApp = (id: string) => appRegistry.find((a) => a.id === id);
