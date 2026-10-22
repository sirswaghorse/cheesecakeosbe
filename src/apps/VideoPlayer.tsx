import { useState, useRef, useEffect } from "react";
import { useLocalFiles, type LocalFile } from "@/lib/localFs";

type VideoFile = LocalFile;

const VideoPlayer = () => {
  const { files: videos } = useLocalFiles("video/");
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [currentName, setCurrentName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => () => { if (currentVideo) URL.revokeObjectURL(currentVideo); }, [currentVideo]);

  const playVideo = (v: VideoFile) => {
    setCurrentVideo(URL.createObjectURL(v.blob));
    setCurrentName(v.file_name);
  };

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
