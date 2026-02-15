import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VideoFile {
  id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
}

const VideoPlayer = () => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [user, setUser] = useState<any>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [currentName, setCurrentName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const fetchVideos = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_files")
      .select("id, file_name, file_type, storage_path")
      .like("file_type", "video/%")
      .order("created_at", { ascending: false });
    if (data) setVideos(data);
  }, [user]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const playVideo = (v: VideoFile) => {
    const { data } = supabase.storage.from("user-files").getPublicUrl(v.storage_path);
    setCurrentVideo(data.publicUrl);
    setCurrentName(v.file_name);
  };

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 p-4" style={{ background: "hsl(0 0% 8%)" }}>
        <span className="text-3xl">🎬</span>
        <p className="text-sm font-medium" style={{ color: "hsl(0 0% 70%)" }}>Please log in to access your videos.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(0 0% 8%)" }}>
      {/* Player area */}
      <div className="flex-1 flex items-center justify-center min-h-0 p-2">
        {currentVideo ? (
          <video
            ref={videoRef}
            src={currentVideo}
            controls
            autoPlay
            className="max-w-full max-h-full rounded"
            style={{ background: "black" }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-50">
            <span className="text-5xl">▶️</span>
            <p className="text-xs" style={{ color: "hsl(0 0% 55%)" }}>
              {videos.length === 0 ? "No videos found. Upload videos in Documents." : "Select a video to play."}
            </p>
          </div>
        )}
      </div>

      {/* Now playing bar */}
      {currentName && (
        <div className="px-3 py-1 text-xs truncate" style={{ color: "hsl(0 0% 70%)", background: "hsl(0 0% 12%)" }}>
          ▶ {currentName}
        </div>
      )}

      {/* Playlist */}
      <div
        className="shrink-0 overflow-auto border-t"
        style={{ maxHeight: 140, borderColor: "hsl(0 0% 18%)", background: "hsl(0 0% 10%)" }}
      >
        {videos.map((v) => (
          <div
            key={v.id}
            className="flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors"
            style={{
              background: currentVideo && currentName === v.file_name ? "hsl(210 50% 25%)" : "transparent",
              color: "hsl(0 0% 80%)",
            }}
            onClick={() => playVideo(v)}
            onMouseEnter={(e) => { if (currentName !== v.file_name) e.currentTarget.style.background = "hsl(0 0% 15%)"; }}
            onMouseLeave={(e) => { if (currentName !== v.file_name) e.currentTarget.style.background = "transparent"; }}
          >
            <span className="text-sm">🎬</span>
            <span className="text-xs truncate">{v.file_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPlayer;
