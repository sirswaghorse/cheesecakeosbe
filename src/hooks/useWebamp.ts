import { useEffect, useRef, useCallback, useState } from "react";
import Webamp from "webamp";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_TRACKS = [
  {
    metaData: { artist: "DJ Mike Llama", title: "Llama Whippin' Intro" },
    url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
    duration: 5.322286,
  },
];

async function getUserAudioTracks() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const { data: files } = await supabase
    .from("user_files")
    .select("file_name, file_type, storage_path")
    .like("file_type", "audio/%");

  if (!files || files.length === 0) return [];

  return files.map((f) => {
    const { data } = supabase.storage.from("user-files").getPublicUrl(f.storage_path);
    return {
      metaData: { artist: "My Music", title: f.file_name },
      url: data.publicUrl,
    };
  });
}

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

  const open = useCallback(async () => {
    if (webampRef.current || !containerRef.current) return;

    // Load user audio files, fall back to defaults
    const userTracks = await getUserAudioTracks();
    const tracks = userTracks.length > 0 ? userTracks : DEFAULT_TRACKS;

    const webamp = new Webamp({ initialTracks: tracks });
    webampRef.current = webamp;

    webamp.renderWhenReady(containerRef.current).then(() => {
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
