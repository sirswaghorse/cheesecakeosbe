import { useMemo } from "react";
import { useLocalFiles, VIRTUAL_DISK_SIZE } from "@/lib/localFs";
import { Progress } from "@/components/ui/progress";

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byType: { type: string; count: number; size: number }[];
}

const FILE_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  image: { label: "Images", icon: "🖼️" },
  video: { label: "Videos", icon: "🎬" },
  audio: { label: "Audio", icon: "🎵" },
  application: { label: "Documents", icon: "📄" },
  text: { label: "Text Files", icon: "📃" },
  other: { label: "Other", icon: "📁" },
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const getTypeCategory = (fileType: string): string => {
  if (fileType.startsWith("image/")) return "image";
  if (fileType.startsWith("video/")) return "video";
  if (fileType.startsWith("audio/")) return "audio";
  if (fileType.startsWith("application/")) return "application";
  if (fileType.startsWith("text/")) return "text";
  return "other";
};

const STORAGE_LIMIT = VIRTUAL_DISK_SIZE;

const Computer = () => {
  const { files, loading } = useLocalFiles();
  const stats: StorageStats = useMemo(() => {
    const byTypeMap = new Map<string, { count: number; size: number }>();
    let totalSize = 0;
    for (const file of files) {
      const cat = getTypeCategory(file.file_type);
      const e = byTypeMap.get(cat) || { count: 0, size: 0 };
      e.count++; e.size += file.file_size;
      byTypeMap.set(cat, e);
      totalSize += file.file_size;
    }
    return {
      totalFiles: files.length,
      totalSize,
      byType: Array.from(byTypeMap.entries()).map(([type, i]) => ({ type, ...i })).sort((x, y) => y.size - x.size),
    };
  }, [files]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "hsl(220 14% 96%)" }}>
        <span className="text-sm" style={{ color: "hsl(210 15% 50%)" }}>Loading…</span>
      </div>
    );
  }

  const usagePercent = stats ? Math.min((stats.totalSize / STORAGE_LIMIT) * 100, 100) : 0;

  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(220 14% 96%)" }}>
      {/* Header */}
      <div
        className="px-4 py-3 border-b shrink-0 flex items-center gap-3"
        style={{ borderColor: "hsl(210 15% 85%)", background: "hsl(210 30% 97%)" }}
      >
        <span className="text-2xl">💻</span>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "hsl(210 20% 20%)" }}>My Computer</h2>
          <p className="text-[11px]" style={{ color: "hsl(210 15% 50%)" }}>Storage overview</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Storage drive */}
        <div
          className="rounded-lg p-4 border"
          style={{ background: "white", borderColor: "hsl(210 15% 85%)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">💾</span>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "hsl(210 20% 20%)" }}>
                Local Disk (C:)
              </p>
              <p className="text-[11px]" style={{ color: "hsl(210 15% 50%)" }}>
                {formatSize(stats?.totalSize ?? 0)} used of {formatSize(STORAGE_LIMIT)}
              </p>
            </div>
          </div>
          <Progress value={usagePercent} className="h-3 rounded" />
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px]" style={{ color: "hsl(210 15% 55%)" }}>
              {formatSize(STORAGE_LIMIT - (stats?.totalSize ?? 0))} free
            </span>
            <span className="text-[10px]" style={{ color: "hsl(210 15% 55%)" }}>
              {usagePercent.toFixed(1)}% used
            </span>
          </div>
        </div>

        {/* File breakdown */}
        <div
          className="rounded-lg p-4 border"
          style={{ background: "white", borderColor: "hsl(210 15% 85%)" }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: "hsl(210 20% 20%)" }}>
            Storage Breakdown
          </p>
          {stats && stats.byType.length > 0 ? (
            <div className="space-y-2">
              {stats.byType.map(({ type, count, size }) => {
                const info = FILE_TYPE_LABELS[type] || FILE_TYPE_LABELS.other;
                const pct = (size / STORAGE_LIMIT) * 100;
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-base w-6 text-center">{info.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span style={{ color: "hsl(210 20% 25%)" }}>{info.label}</span>
                        <span style={{ color: "hsl(210 15% 50%)" }}>
                          {count} file{count !== 1 ? "s" : ""} · {formatSize(size)}
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "hsl(210 20% 92%)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(pct, 0.5)}%`,
                            background: "linear-gradient(90deg, hsl(210 60% 50%), hsl(210 55% 60%))",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-center py-4" style={{ color: "hsl(210 15% 55%)" }}>
              No files uploaded yet.
            </p>
          )}
        </div>

        {/* Summary */}
        <div
          className="rounded-lg p-3 border flex items-center justify-between"
          style={{ background: "white", borderColor: "hsl(210 15% 85%)" }}
        >
          <span className="text-xs" style={{ color: "hsl(210 15% 50%)" }}>Total files</span>
          <span className="text-sm font-semibold" style={{ color: "hsl(210 20% 20%)" }}>
            {stats?.totalFiles ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Computer;
