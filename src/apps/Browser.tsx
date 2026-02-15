import { useState, useRef, KeyboardEvent } from "react";

const Browser = () => {
  const [url, setUrl] = useState("https://www.google.com/webhp?igu=1");
  const [addressBar, setAddressBar] = useState("https://www.google.com");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (target?: string) => {
    let dest = target || addressBar.trim();
    if (!dest) return;
    if (!dest.startsWith("http://") && !dest.startsWith("https://")) {
      // If it looks like a URL, add https, otherwise search Google
      if (dest.includes(".") && !dest.includes(" ")) {
        dest = `https://${dest}`;
      } else {
        dest = `https://www.google.com/search?igu=1&q=${encodeURIComponent(dest)}`;
      }
    }
    setUrl(dest);
    setAddressBar(dest);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") navigate();
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ background: "#f0f0f0" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b" style={{ background: "#e8e8e8", borderColor: "#ccc" }}>
        <button
          onClick={() => navigate("https://www.google.com/webhp?igu=1")}
          className="px-2 py-0.5 text-xs rounded hover:bg-white/60"
          title="Home"
        >
          🏠
        </button>
        <input
          value={addressBar}
          onChange={(e) => setAddressBar(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 text-xs px-2 py-1 rounded border bg-white"
          style={{ borderColor: "#aaa" }}
          placeholder="Search or enter URL"
        />
        <button
          onClick={() => navigate()}
          className="px-2 py-0.5 text-xs rounded hover:bg-white/60"
          title="Go"
        >
          ➜
        </button>
      </div>
      {/* Content */}
      <iframe
        ref={iframeRef}
        src={url}
        className="flex-1 w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Browser"
      />
    </div>
  );
};

export default Browser;
