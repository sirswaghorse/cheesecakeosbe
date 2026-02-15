import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

const FILE_ICONS: Record<string, string> = {
  image: "🖼️",
  video: "🎬",
  audio: "🎵",
  pdf: "📄",
  document: "📃",
  spreadsheet: "📊",
  default: "📁",
};

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return FILE_ICONS.image;
  if (type.startsWith("video/")) return FILE_ICONS.video;
  if (type.startsWith("audio/")) return FILE_ICONS.audio;
  if (type.includes("pdf")) return FILE_ICONS.pdf;
  if (type.includes("sheet") || type.includes("excel")) return FILE_ICONS.spreadsheet;
  if (type.includes("document") || type.includes("word")) return FILE_ICONS.document;
  return FILE_ICONS.default;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Documents = () => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>("");
  const [msg, setMsg] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchFiles = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_files")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setFiles(data);
  }, [user]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setMsg("");

    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("user-files")
      .upload(path, file);

    if (uploadErr) {
      setMsg("Upload failed: " + uploadErr.message);
      setUploading(false);
      return;
    }

    await supabase.from("user_files").insert({
      user_id: user.id,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: path,
    });

    await fetchFiles();
    setUploading(false);
    setMsg("File uploaded!");
    setTimeout(() => setMsg(""), 2000);
  };

  const handleDelete = async (file: UserFile) => {
    await supabase.storage.from("user-files").remove([file.storage_path]);
    await supabase.from("user_files").delete().eq("id", file.id);
    setPreviewUrl(null);
    fetchFiles();
  };

  const handlePreview = (file: UserFile) => {
    if (renamingId) return;
    const { data } = supabase.storage.from("user-files").getPublicUrl(file.storage_path);
    setPreviewUrl(data.publicUrl);
    setPreviewType(file.file_type);
  };

  const startRename = (file: UserFile) => {
    setRenamingId(file.id);
    setRenameValue(file.file_name);
  };

  const confirmRename = async () => {
    if (!renamingId || !renameValue.trim()) return;
    await supabase.from("user_files").update({ file_name: renameValue.trim() }).eq("id", renamingId);
    setRenamingId(null);
    fetchFiles();
  };

  const filtered = files.filter((f) =>
    f.file_name.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 p-4" style={{ background: "hsl(220 14% 96%)" }}>
        <span className="text-3xl">📂</span>
        <p className="text-sm font-medium" style={{ color: "hsl(210 20% 30%)" }}>
          Please log in to access your documents.
        </p>
        <p className="text-xs" style={{ color: "hsl(210 15% 50%)" }}>
          Open User Account from the Start menu.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(220 14% 96%)" }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b shrink-0"
        style={{ borderColor: "hsl(210 15% 85%)", background: "hsl(210 30% 97%)" }}
      >
        <span className="text-lg">📂</span>
        <span className="text-sm font-semibold" style={{ color: "hsl(210 20% 20%)" }}>
          My Documents
        </span>
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Search files…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-2 py-1 text-xs rounded border outline-none w-36"
          style={{
            background: "white",
            borderColor: "hsl(210 20% 82%)",
            color: "hsl(210 20% 15%)",
          }}
        />
        <label
          className="px-3 py-1 text-xs font-medium rounded cursor-pointer"
          style={{
            background: "linear-gradient(180deg, hsl(210 60% 50%), hsl(210 60% 42%))",
            color: "white",
            border: "1px solid hsl(210 50% 35%)",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {msg && (
        <div className="px-3 py-1 text-xs" style={{ color: "hsl(210 50% 40%)", background: "hsl(210 40% 95%)" }}>
          {msg}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File list */}
        <div className="flex-1 overflow-auto p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <span className="text-2xl opacity-40">📂</span>
              <p className="text-xs" style={{ color: "hsl(210 15% 55%)" }}>
                {files.length === 0 ? "No files yet. Upload something!" : "No matching files."}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[hsl(210_40%_92%)] transition-colors group"
                  onClick={() => handlePreview(file)}
                >
                  <span className="text-base">{getFileIcon(file.file_type)}</span>
                  <div className="flex-1 min-w-0">
                    {renamingId === file.id ? (
                      <form
                        className="flex items-center gap-1"
                        onSubmit={(e) => { e.preventDefault(); confirmRename(); }}
                      >
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={confirmRename}
                          onKeyDown={(e) => { if (e.key === "Escape") setRenamingId(null); }}
                          className="text-xs px-1 py-0.5 rounded border outline-none w-full"
                          style={{ borderColor: "hsl(210 50% 70%)", color: "hsl(210 20% 15%)" }}
                        />
                      </form>
                    ) : (
                      <>
                        <p className="text-xs font-medium truncate" style={{ color: "hsl(210 20% 20%)" }}>
                          {file.file_name}
                        </p>
                        <p className="text-[10px]" style={{ color: "hsl(210 15% 55%)" }}>
                          {formatSize(file.file_size)} · {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>
                  {renamingId !== file.id && (
                    <button
                      className="opacity-0 group-hover:opacity-100 text-xs px-1.5 py-0.5 rounded transition-opacity"
                      style={{ color: "hsl(210 50% 40%)" }}
                      onClick={(e) => { e.stopPropagation(); startRename(file); }}
                      title="Rename"
                    >
                      ✏️
                    </button>
                  )}
                  <button
                    className="opacity-0 group-hover:opacity-100 text-xs px-1.5 py-0.5 rounded transition-opacity"
                    style={{ background: "hsl(0 60% 50%)", color: "white" }}
                    onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview panel */}
        {previewUrl && (
          <div
            className="w-[45%] border-l overflow-auto p-3 flex flex-col items-center justify-center shrink-0"
            style={{ borderColor: "hsl(210 15% 85%)", background: "hsl(220 10% 98%)" }}
          >
            <button
              className="self-end text-xs mb-2 underline"
              style={{ color: "hsl(210 40% 45%)" }}
              onClick={() => setPreviewUrl(null)}
            >
              Close
            </button>
            {previewType.startsWith("image/") ? (
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-60 rounded shadow-sm" />
            ) : previewType.startsWith("video/") ? (
              <video src={previewUrl} controls className="max-w-full max-h-60 rounded shadow-sm" />
            ) : previewType.startsWith("audio/") ? (
              <audio src={previewUrl} controls className="w-full" />
            ) : (
              <div className="text-center">
                <span className="text-4xl block mb-2">📄</span>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline"
                  style={{ color: "hsl(210 60% 45%)" }}
                >
                  Open file
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
