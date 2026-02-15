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
 * Returns { open, isOpen } — call open() to launch the player.
 */
export const useWebamp = () => {
  const webampRef = useRef<Webamp | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    if (webampRef.current) return; // already open

    const webamp = new Webamp({ initialTracks: DEFAULT_TRACKS });
    webampRef.current = webamp;

    webamp.renderWhenReady(document.body).then(() => {
      setIsOpen(true);
    });

    webamp.onClose(() => {
      webamp.dispose();
      webampRef.current = null;
      setIsOpen(false);
    });
  }, []);

  // Cleanup on unmount
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
