import { Cast, Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ProjectionControls } from "@/components/settings/SystemSettings";
import { openSettingsSection } from "@/lib/systemSettings";
import { useWindows } from "@/contexts/WindowContext";
import { useState } from "react";

export default function ProjectFlyout() {
  const { openApp } = useWindows();
  const [open, setOpen] = useState(false);
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><Button variant="ghost" size="icon" title="Project / Cast" aria-label="Project / Cast" className="h-9 w-8 text-foreground/80 hover:bg-primary/30"><Cast /></Button></PopoverTrigger>
    <PopoverContent side="top" align="end" sideOffset={10} className="cheesecake-store w-80 max-w-[calc(100vw-16px)] bg-background text-foreground z-[10000] animate-in slide-in-from-bottom-2 fade-in motion-reduce:animate-none">
      <h2 className="font-semibold text-sm flex items-center gap-2"><Cast className="size-4 text-primary" />Project / Cast</h2>
      <ProjectionControls />
      <Button variant="link" className="px-0 text-xs mt-2" onClick={() => { openSettingsSection("display"); openApp("controlpanel"); setOpen(false); }}><Settings2 />Display settings</Button>
    </PopoverContent>
  </Popover>;
}