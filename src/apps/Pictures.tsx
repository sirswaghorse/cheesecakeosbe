import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserFile {
  id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  created_at: string;
}

const Pictures = () => {
  const [images, setImages] = useState<UserFile[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selected, setSelected] = useState<UserFile | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const fetchImages = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_files")
      .select("*")
      .like("file_type", "image/%")
      .order("created_at", { ascending: false });
    if (data) setImages(data);
  }, [user]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const getUrl = (path: string) =>
    supabase.storage.from("user-files").getPublicUrl(path).data.publicUrl;

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 p-4" style={{ background: "hsl(220 14% 96%)" }}>
        <span className="text-3xl">🖼️</span>
        <p className="text-sm font-medium" style={{ color: "hsl(210 20% 30%)" }}>Please log in to view your pictures.</p>
        <p className="text-xs" style={{ color: "hsl(210 15% 50%)" }}>Open User Account from the Start menu.</p>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="h-full flex flex-col" style={{ background: "hsl(0 0% 10%)" }}>
        <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ background: "hsl(0 0% 15%)" }}>
          <button
            onClick={() => setSelected(null)}
            className="text-xs px-2 py-1 rounded"
            style={{ background: "hsl(0 0% 25%)", color: "hsl(0 0% 85%)" }}
          >
            ← Back
          </button>
          <span className="text-xs truncate" style={{ color: "hsl(0 0% 75%)" }}>{selected.file_name}</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <img
            src={getUrl(selected.storage_path)}
            alt={selected.file_name}
            className="max-w-full max-h-full object-contain rounded shadow-lg"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(220 14% 96%)" }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: "hsl(210 15% 85%)", background: "hsl(210 30% 97%)" }}>
        <span className="text-lg">🖼️</span>
        <span className="text-sm font-semibold" style={{ color: "hsl(210 20% 20%)" }}>My Pictures</span>
        <span className="text-xs ml-auto" style={{ color: "hsl(210 15% 55%)" }}>{images.length} image{images.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-3xl opacity-40">🖼️</span>
            <p className="text-xs" style={{ color: "hsl(210 15% 55%)" }}>No images yet. Upload some in Documents!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="cursor-pointer group relative aspect-square rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                onClick={() => setSelected(img)}
              >
                <img
                  src={getUrl(img.storage_path)}
                  alt={img.file_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div
                  className="absolute bottom-0 inset-x-0 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(transparent, hsla(0 0% 0% / 0.7))" }}
                >
                  <p className="text-[10px] truncate" style={{ color: "white" }}>{img.file_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pictures;
