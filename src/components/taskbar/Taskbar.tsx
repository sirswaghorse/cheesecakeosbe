import StartButton from "./StartButton";
import TaskbarButtons from "./TaskbarButtons";
import Clock from "./Clock";
import SystemTray from "./SystemTray";
import CheesecakeAI from "./CheesecakeAI";
import { useWindows } from "@/contexts/WindowContext";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu";

const Taskbar = ({ onShutdown }: { onShutdown?: () => void }) => {
  const { setDesktopPeek, toggleShowDesktop, openApp } = useWindows();
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="win-glass fixed bottom-0 left-0 right-0 h-12 flex items-center z-[9998]">
          <StartButton onShutdown={onShutdown} />
          <CheesecakeAI />
          <TaskbarButtons />
          <div className="flex items-center gap-1 mr-1">
            <SystemTray />
            <Clock />
          </div>
          <button
            aria-label="Show desktop"
            title="Show desktop"
            className="h-full w-3 border-l border-border/40 hover:bg-primary/30 transition-colors"
            onMouseEnter={() => setDesktopPeek(true)}
            onMouseLeave={() => setDesktopPeek(false)}
            onClick={() => { setDesktopPeek(false); toggleShowDesktop(); }}
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52 z-[10000]">
        <ContextMenuItem onSelect={() => toggleShowDesktop()}>Show the desktop</ContextMenuItem>
        <ContextMenuItem onSelect={() => openApp("taskmanager")}>Start Task Manager</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => openApp("controlpanel")}>Properties</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Taskbar;
