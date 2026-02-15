import { useEffect, useRef, useCallback, useState } from "react";
import Webamp from "webamp";

const DEFAULT_TRACKS = [
  {
    metaData: { artist: "DJ Mike Llama", title: "Llama Whippin' Intro" },
    url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
    duration: 5.322286,
  },
];

/**
 * Hook that manages a Webamp instance.
 * Renders into a persistent container div so it doesn't hijack the page.
 */
export const useWebamp = () => {
  const webampRef = useRef<Webamp | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Create persistent container on mount
  useEffect(() => {
    const container = document.createElement("div");
    container.id = "webamp-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9000";
    document.body.appendChild(container);
    containerRef.current = container;

    return () => {
      container.remove();
    };
  }, []);

  const open = useCallback(() => {
    if (webampRef.current || !containerRef.current) return;

    const webamp = new Webamp({ initialTracks: DEFAULT_TRACKS });
    webampRef.current = webamp;

    webamp.renderWhenReady(containerRef.current).then(() => {
      // Make the webamp element itself interactive
      const webampEl = document.getElementById("webamp");
      if (webampEl) {
        webampEl.style.pointerEvents = "auto";
      }
      setIsOpen(true);
    });

    webamp.onClose(() => {
      webamp.dispose();
      webampRef.current = null;
      setIsOpen(false);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (webampRef.current) {
        webampRef.current.dispose();
        webampRef.current = null;
      }
    };
  }, []);

  return { open, isOpen };
};
