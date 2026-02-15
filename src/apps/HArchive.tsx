import { useState } from "react";

const TARGET_URL = "https://humper.furbit.social";

const HArchive = () => {
  const [loadError, setLoadError] = useState(false);

  const openExternal = () => {
    window.open(TARGET_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ background: "#f0f0f0" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1 border-b" style={{ background: "#e8e8e8", borderColor: "#ccc" }}>
        <span className="text-xs font-medium" style={{ color: "#333" }}>H Archive</span>
        <button
          onClick={openExternal}
          className="px-2 py-0.5 text-xs rounded hover:bg-white/60"
          title="Open in new tab"
          style={{ color: "#333" }}
        >
          Open in browser ↗
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 relative">
        {!loadError && (
          <iframe
            src={TARGET_URL}
            className="w-full h-full border-0 absolute inset-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="H Archive"
            onError={() => setLoadError(true)}
            onLoad={(e) => {
              try {
                const doc = e.currentTarget.contentDocument;
                if (doc && doc.title === "") {
                  // Possibly blocked
                }
              } catch {
                setLoadError(true);
              }
            }}
          />
        )}
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: "#f0f0f0" }}>
            <div className="text-2xl">🚫</div>
            <p className="text-sm font-medium" style={{ color: "#333" }}>This site can't be displayed inline</p>
            <p className="text-xs max-w-xs text-center" style={{ color: "#666" }}>
              Open it in a new browser tab instead.
            </p>
            <button
              onClick={openExternal}
              className="px-4 py-1.5 text-xs rounded text-white"
              style={{ background: "hsl(210 80% 50%)" }}
            >
              Open in new tab ↗
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HArchive;
