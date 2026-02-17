import { useState } from "react";

const UniAI = () => {
  const [loadError, setLoadError] = useState(false);
  const url = "https://uni.furbit.social/";

  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(220 14% 96%)" }}>
      {loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="text-4xl">🦄</span>
          <p className="text-sm text-[hsl(210_10%_40%)]">
            This site cannot be displayed in an embedded frame.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded text-sm font-medium text-white"
            style={{ background: "hsl(210 65% 48%)" }}
          >
            Open in new tab ↗
          </a>
        </div>
      ) : (
        <iframe
          src={url}
          className="w-full flex-1 border-none"
          title="Uni AI"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
          onError={() => setLoadError(true)}
        />
      )}
    </div>
  );
};

export default UniAI;
