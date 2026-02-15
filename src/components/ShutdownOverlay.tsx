const ShutdownOverlay = ({ phase }: { phase: "shuttingDown" | "booting" }) => {
  const isShutdown = phase === "shuttingDown";

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        {/* Windows-style spinner */}
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
            style={{
              borderTopColor: "hsl(210 80% 60%)",
              borderRightColor: "hsl(210 60% 40%)",
              animationDuration: "1.2s",
            }}
          />
        </div>
        <p className="text-white/80 text-lg font-light tracking-wide">
          {isShutdown ? "Shutting down..." : "Starting Windows..."}
        </p>
      </div>
    </div>
  );
};

export default ShutdownOverlay;
