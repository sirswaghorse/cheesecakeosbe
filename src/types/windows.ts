import { ComponentType } from "react";

export interface AppConfig {
  id: string;
  name: string;
  icon: string; // emoji or image URL
  defaultWidth: number;
  defaultHeight: number;
  component: ComponentType;
  desktopIcon?: boolean;
  startMenu?: boolean;
}

export interface WindowState {
  id: string;
  appId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  focused: boolean;
  /** Pre-snap geometry; set while the window is snapped to a screen edge */
  restore?: { x: number; y: number; width: number; height: number };
}
