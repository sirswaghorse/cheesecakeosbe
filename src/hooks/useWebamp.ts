import { useEffect, useRef, useCallback, useState } from "react";
import Webamp from "webamp";
import { loadLocalAudioPlaylist } from "@/lib/localAudio";
import { toast } from "@/hooks/use-toast";

/**
 * Hook that manages a Webamp instance.
 * Renders into a persistent container div so it doesn't hijack the page.
 */
export const useWebamp = () => {
  const webampRef = useRef<Webamp | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const openingRef = useRef(false);
  const releaseRef = useRef<(() => void) | null>(null);
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
      containerRef.current = null;
      webampRef.current?.dispose();
      webampRef.current = null;
      releaseRef.current?.();
      releaseRef.current = null;
      container.remove();
    };
  }, []);

  const open = useCallback(async () => {
    const container = containerRef.current;
    if (openingRef.current || webampRef.current || !container) return;
    openingRef.current = true;
    let playlist: Awaited<ReturnType<typeof loadLocalAudioPlaylist>> | undefined;
    let webamp: Webamp | undefined;
    try {
      playlist = await loadLocalAudioPlaylist();
      if (containerRef.current !== container) {
        playlist.dispose();
        return;
      }
      // The default skin is bundled. No remote samples or skins are loaded.
      webamp = new Webamp({});
      webampRef.current = webamp;
      releaseRef.current = playlist.dispose;
      webamp.onClose(() => {
        if (webampRef.current !== webamp) return;
        webamp?.dispose();
        webampRef.current = null;
        releaseRef.current?.();
        releaseRef.current = null;
        setIsOpen(false);
      });
      await webamp.renderWhenReady(container);
      if (containerRef.current !== container || webampRef.current !== webamp) return;
      webamp.appendTracks(playlist.tracks);
      const webampEl = container.querySelector<HTMLElement>("#webamp");
      if (webampEl) webampEl.style.pointerEvents = "auto";
      setIsOpen(true);
    } catch {
      webamp?.dispose();
      playlist?.dispose();
      if (containerRef.current === container) {
        webampRef.current = null;
        releaseRef.current = null;
        setIsOpen(false);
        toast({ title: "Winamp couldn't open", description: "Your saved music could not be loaded. Try opening Winamp again.", variant: "destructive" });
      }
    } finally {
      openingRef.current = false;
    }
  }, []);

  return { open, isOpen };
};
