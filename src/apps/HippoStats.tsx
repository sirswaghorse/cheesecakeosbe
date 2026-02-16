import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import hippoIcon from "@/assets/hippo-stats-icon.png";

// Mock stats for display — in a real integration the LSL script POSTs live data
const MOCK_STATS = {
  region_name: "My Region",
  product_name: "Full Region",
  fps: 44.8,
  time_dilation: 0.998,
  agents: 3,
  wind: { x: 2.1, y: -0.8, z: 0.0 },
  sun_dir: { x: 0.3, y: 0.9, z: 0.2 },
  sim_time: 43200,
};

const StatRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-center py-1.5 px-3 text-sm border-b border-[hsl(220_14%_90%)]">
    <span className="text-[hsl(210_10%_45%)] font-medium">{label}</span>
    <span className="text-[hsl(220_10%_20%)] font-mono">{value}</span>
  </div>
);

const HippoStats = () => {
  const [stats] = useState(MOCK_STATS);

  const handleDownloadScript = () => {
    const link = document.createElement("a");
    link.href = "/HippoStats_Reporter.lsl";
    link.download = "HippoStats_Reporter.lsl";
    link.click();
  };

  const fpsColor =
    stats.fps >= 40 ? "hsl(140 60% 40%)" : stats.fps >= 20 ? "hsl(40 80% 45%)" : "hsl(0 70% 50%)";

  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(220 14% 96%)" }}>
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-3 border-b border-[hsl(220_14%_88%)]">
        <img src={hippoIcon} alt="Hippo Stats" className="w-10 h-10 rounded-lg object-cover" />
        <div>
          <h1 className="text-base font-bold text-[hsl(220_10%_20%)]">Hippo Stats</h1>
          <p className="text-[11px] text-[hsl(210_10%_50%)]">Second Life / Kitely Region Monitor</p>
        </div>
      </div>

      <Tabs defaultValue="stats" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 h-8">
          <TabsTrigger value="stats" className="flex-1 text-xs h-6">📊 Region Stats</TabsTrigger>
          <TabsTrigger value="script" className="flex-1 text-xs h-6">📜 LSL Script</TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats" className="flex-1 overflow-hidden mt-2">
          <ScrollArea className="h-full">
            <div className="px-4 pb-4">
              <div className="rounded-lg border border-[hsl(220_14%_88%)] overflow-hidden bg-white">
                <div className="px-3 py-2 bg-[hsl(210_30%_95%)] border-b border-[hsl(220_14%_88%)]">
                  <span className="text-xs font-semibold text-[hsl(210_20%_40%)]">
                    🌐 {stats.region_name}
                  </span>
                  <span className="text-[10px] text-[hsl(210_10%_55%)] ml-2">({stats.product_name})</span>
                </div>
                <StatRow label="Sim FPS" value={stats.fps.toFixed(1)} />
                <StatRow label="Time Dilation" value={stats.time_dilation.toFixed(3)} />
                <StatRow label="Agents" value={stats.agents} />
                <StatRow label="Wind" value={`${stats.wind.x.toFixed(1)}, ${stats.wind.y.toFixed(1)}, ${stats.wind.z.toFixed(1)}`} />
                <StatRow label="Sun Direction" value={`${stats.sun_dir.x.toFixed(1)}, ${stats.sun_dir.y.toFixed(1)}, ${stats.sun_dir.z.toFixed(1)}`} />
                <StatRow label="Sim Time" value={`${Math.floor(stats.sim_time / 3600)}h ${Math.floor((stats.sim_time % 3600) / 60)}m`} />
              </div>

              {/* Health indicator */}
              <div className="mt-3 p-3 rounded-lg border border-[hsl(220_14%_88%)] bg-white flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: fpsColor }} />
                <div>
                  <span className="text-xs font-semibold text-[hsl(220_10%_20%)]">Region Health: </span>
                  <span className="text-xs" style={{ color: fpsColor }}>
                    {stats.fps >= 40 ? "Excellent" : stats.fps >= 20 ? "Fair" : "Poor"}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-[hsl(210_10%_55%)] mt-3 text-center">
                Place the LSL script in-world to receive live stats
              </p>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Script Tab */}
        <TabsContent value="script" className="flex-1 overflow-hidden mt-2">
          <ScrollArea className="h-full">
            <div className="px-4 pb-4 space-y-3">
              <div className="rounded-lg border border-[hsl(220_14%_88%)] bg-white p-3">
                <h2 className="text-sm font-bold text-[hsl(220_10%_20%)] mb-1">HippoStats Reporter Script</h2>
                <p className="text-xs text-[hsl(210_10%_50%)] mb-3">
                  This LSL script collects region statistics (FPS, time dilation, agent count, wind, sun direction) and
                  sends them to your HorseshoeOS dashboard every 30 seconds.
                </p>
                <h3 className="text-xs font-semibold text-[hsl(220_10%_25%)] mb-1">Setup Instructions:</h3>
                <ol className="text-xs text-[hsl(210_10%_45%)] space-y-1 list-decimal list-inside mb-3">
                  <li>Download the script using the button below</li>
                  <li>Create a new script in a prim in your region</li>
                  <li>Replace the contents with the downloaded script</li>
                  <li>Update the <code className="bg-[hsl(220_14%_92%)] px-1 rounded text-[11px]">ENDPOINT_URL</code> variable</li>
                  <li>Save — stats will begin reporting automatically</li>
                </ol>
                <p className="text-[10px] text-[hsl(210_10%_55%)] mb-3">
                  Compatible with Second Life and Kitely (OpenSim) regions.
                </p>
              </div>

              <Button onClick={handleDownloadScript} className="w-full h-9 text-sm">
                📥 Download LSL Script
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HippoStats;
