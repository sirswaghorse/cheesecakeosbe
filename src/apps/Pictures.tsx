import { useState } from "react";
import { useLocalFiles, useObjectUrls, type LocalFile } from "@/lib/localFs";

const Pictures = () => {
  const { files: images } = useLocalFiles("image/");
  const urls = useObjectUrls(images);
  const [selected, setSelected] = useState<LocalFile | null>(null);

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
            src={urls[selected.id]}
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
                  src={urls[img.id]}
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
