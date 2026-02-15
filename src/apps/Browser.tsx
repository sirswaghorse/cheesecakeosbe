import { useState, useRef, KeyboardEvent } from "react";

const Browser = () => {
  const [url, setUrl] = useState("https://www.google.com/webhp?igu=1");
  const [addressBar, setAddressBar] = useState("https://www.google.com");
  const [loadError, setLoadError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (target?: string) => {
    let dest = target || addressBar.trim();
    if (!dest) return;
    if (!dest.startsWith("http://") && !dest.startsWith("https://")) {
      if (dest.includes(".") && !dest.includes(" ")) {
        dest = `https://${dest}`;
      } else {
        dest = `https://www.google.com/search?igu=1&q=${encodeURIComponent(dest)}`;
      }
    }
    setLoadError(false);
    setUrl(dest);
    setAddressBar(dest);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") navigate();
  };

  const openExternal = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ background: "#f0f0f0" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b" style={{ background: "#e8e8e8", borderColor: "#ccc" }}>
        <button
          onClick={() => navigate("https://www.google.com/webhp?igu=1")}
          className="px-2 py-0.5 text-xs rounded hover:bg-white/60"
          title="Home"
          style={{ color: "#333" }}
        >
          🏠
        </button>
        <input
          value={addressBar}
          onChange={(e) => setAddressBar(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 text-xs px-2 py-1 rounded border bg-white text-black"
          style={{ borderColor: "#aaa" }}
          placeholder="Search or enter URL"
        />
        <button
          onClick={() => navigate()}
          className="px-2 py-0.5 text-xs rounded hover:bg-white/60"
          title="Go"
          style={{ color: "#333" }}
        >
          ➜
        </button>
        <button
          onClick={openExternal}
          className="px-2 py-0.5 text-xs rounded hover:bg-white/60"
          title="Open in new tab"
          style={{ color: "#333" }}
        >
          ↗
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0 absolute inset-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          title="Browser"
          onError={() => setLoadError(true)}
          onLoad={(e) => {
            try {
              // Try accessing the iframe content - if blocked, it'll throw
              const iframe = e.currentTarget;
              const doc = iframe.contentDocument;
              if (doc && doc.title === "") {
                // Possibly blocked
              }
            } catch {
              setLoadError(true);
            }
          }}
        />
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: "#f0f0f0" }}>
            <div className="text-2xl">🚫</div>
            <p className="text-sm font-medium" style={{ color: "#333" }}>This site refused to connect</p>
            <p className="text-xs max-w-xs text-center" style={{ color: "#666" }}>
              This website doesn't allow being displayed inside other pages. You can open it in a new browser tab instead.
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

export default Browser;
