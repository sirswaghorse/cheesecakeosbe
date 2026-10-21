import { SOUND_LABELS, playSound, soundsEnabled, setSoundsEnabled, type SoundName } from "@/lib/sounds";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWallpaper } from "@/contexts/WallpaperContext";
import { wallpaperPresets, toBackgroundImage } from "@/config/wallpaperPresets";

const ControlPanel = () => {
  const [activeTab, setActiveTab] = useState<"account" | "wallpaper" | "sounds">("wallpaper");
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const { wallpaper, setWallpaper } = useWallpaper();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMessage(error.message);
    else {
      setMessage("Password updated!");
      form.reset();
    }
  };

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setWallpaper(dataUrl);
      setMessage("Wallpaper updated!");
    };
    reader.readAsDataURL(file);
  };

  const handleResetWallpaper = () => {
    setWallpaper("");
    setMessage("Wallpaper reset to default.");
  };

  const tabs = [
    { id: "account" as const, label: "Account", icon: "👤" },
    { id: "wallpaper" as const, label: "Wallpaper", icon: "🖼️" },
    { id: "sounds" as const, label: "Sounds", icon: "🔔" },
  ];

  const inputStyle: React.CSSProperties = {
    background: "white",
    borderColor: "hsl(210 20% 80%)",
    color: "hsl(210 20% 20%)",
  };

  const btnStyle: React.CSSProperties = {
    background: "linear-gradient(180deg, hsl(210 60% 50%), hsl(210 60% 42%))",
    color: "white",
    border: "1px solid hsl(210 50% 35%)",
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(210 30% 95%)" }}>
      <div className="flex border-b" style={{ borderColor: "hsl(210 20% 82%)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setMessage(""); }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors"
            style={{
              background: activeTab === tab.id ? "hsl(210 30% 95%)" : "hsl(210 25% 88%)",
              color: activeTab === tab.id ? "hsl(210 20% 25%)" : "hsl(210 15% 50%)",
              borderBottom: activeTab === tab.id ? "2px solid hsl(210 60% 50%)" : "2px solid transparent",
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === "account" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 rounded" style={{ background: "hsl(210 25% 90%)" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "hsl(210 40% 80%)" }}>
                👤
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "hsl(210 20% 25%)" }}>
                  {user ? user.email : "Not signed in"}
                </p>
                <p className="text-xs" style={{ color: "hsl(210 15% 50%)" }}>
                  {user ? "Signed in" : "Open User Account to sign in"}
                </p>
              </div>
            </div>

            {user && (
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-2">
                <h3 className="text-xs font-bold" style={{ color: "hsl(210 20% 30%)" }}>Change Password</h3>
                <input
                  name="newPassword"
                  type="password"
                  placeholder="New password"
                  required
                  minLength={6}
                  className="px-2 py-1.5 text-xs rounded border outline-none"
                  style={inputStyle}
                />
                <button type="submit" className="px-3 py-1.5 text-xs font-medium rounded" style={btnStyle}>
                  Update Password
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === "wallpaper" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold" style={{ color: "hsl(210 20% 30%)" }}>Blueberry Collection</h3>
            <div className="grid grid-cols-3 gap-2">
              {wallpaperPresets.map((p) => {
                const active = wallpaper === p.value;
                return (
                  <button
                    key={p.id}
                    aria-label={p.name}
                    onClick={() => { setWallpaper(p.value); setMessage(`Wallpaper set to ${p.name}.`); }}
                    className="flex flex-col gap-1 p-1 rounded text-left transition-transform hover:scale-[1.03]"
                    style={{ border: active ? "2px solid #818cf8" : "2px solid transparent", background: "white" }}
                  >
                    <div
                      className="w-full aspect-video rounded"
                      style={{ backgroundImage: toBackgroundImage(p.value), backgroundSize: "cover", backgroundPosition: "center" }}
                    />
                    <span className="text-[10px] font-medium truncate" style={{ color: "hsl(230 25% 30%)" }}>{p.name}</span>
                  </button>
                );
              })}
            </div>
            <h3 className="text-xs font-bold" style={{ color: "hsl(210 20% 30%)" }}>Custom Background</h3>
            <p className="text-xs" style={{ color: "hsl(210 15% 50%)" }}>
              Upload an image to use as your desktop wallpaper.
            </p>


            <label
              className="flex flex-col items-center justify-center gap-2 p-6 rounded border-2 border-dashed cursor-pointer hover:bg-white/50 transition-colors"
              style={{ borderColor: "hsl(210 30% 75%)" }}
            >
              <span className="text-3xl">📁</span>
              <span className="text-xs font-medium" style={{ color: "hsl(210 20% 40%)" }}>
                Click to choose an image
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleWallpaperUpload}
              />
            </label>

            <button
              onClick={handleResetWallpaper}
              className="px-3 py-1.5 text-xs font-medium rounded"
              style={{
                background: "linear-gradient(180deg, hsl(210 15% 92%), hsl(210 15% 85%))",
                color: "hsl(210 20% 35%)",
                border: "1px solid hsl(210 15% 75%)",
              }}
            >
              Reset to Default
            </button>
          </div>
        )}

        {activeTab === "sounds" && <SoundsTab />}

        {message && (
          <p className="text-xs mt-3 px-2 py-1.5 rounded" style={{ background: "hsl(210 40% 92%)", color: "hsl(210 50% 40%)" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;

const SoundsTab = () => {
  const [on, setOn] = useState(soundsEnabled());
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold" style={{ color: "hsl(210 20% 25%)" }}>Cheesecake Chimes</h3>
      <label className="flex items-center gap-2 text-xs" style={{ color: "hsl(210 20% 30%)" }}>
        <input type="checkbox" checked={on} onChange={(e) => { setOn(e.target.checked); setSoundsEnabled(e.target.checked); }} />
        Play system sounds
      </label>
      <p className="text-[11px]" style={{ color: "hsl(210 15% 45%)" }}>Sounds follow the taskbar volume and mute settings.</p>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(SOUND_LABELS) as SoundName[]).map((s) => (
          <button key={s} onClick={() => playSound(s, true)} className="flex items-center justify-between px-3 py-2 rounded text-xs" style={{ background: "hsl(210 25% 90%)", color: "hsl(210 20% 25%)" }}>
            {SOUND_LABELS[s]} <span>▶</span>
          </button>
        ))}
      </div>
    </div>
  );
};
