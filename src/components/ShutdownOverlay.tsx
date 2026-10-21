import { useEffect } from "react";
import { playSound } from "@/lib/sounds";

const ShutdownOverlay = ({ phase }: { phase: "shuttingDown" | "booting" }) => {
  const isShutdown = phase === "shuttingDown";
  useEffect(() => { playSound(isShutdown ? "shutdown" : "startup"); }, [isShutdown]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        {/* Windows-style spinner */}
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
            style={{
              borderTopColor: "hsl(239 84% 74%)",
              borderRightColor: "hsl(258 60% 55%)",
              animationDuration: "1.2s",
            }}
          />
        </div>
        <p className="text-white/80 text-lg font-light tracking-wide">
          {isShutdown ? "Shutting down..." : "Starting Cheesecake OS: Blueberry Edition..."}
        </p>
      </div>
    </div>
  );
};

export default ShutdownOverlay;
