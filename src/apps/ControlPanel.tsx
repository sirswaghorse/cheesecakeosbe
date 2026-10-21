import { SOUND_LABELS, playSound, soundsEnabled, setSoundsEnabled, type SoundName } from "@/lib/sounds";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Image, Bell, Settings2, Monitor, ShieldCheck } from "lucide-react";
import { SystemSettings, UpdateSettings, DisplaySettings } from "@/components/settings/SystemSettings";
import { initialSettingsSection, type SettingsSection } from "@/lib/systemSettings";
import { supabase } from "@/integrations/supabase/client";
import { useWallpaper } from "@/contexts/WallpaperContext";
import { wallpaperPresets, toBackgroundImage } from "@/config/wallpaperPresets";

const ControlPanel = () => {
  const [activeTab, setActiveTab] = useState<SettingsSection>(initialSettingsSection);
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

  useEffect(() => {
    const navigate = (event: Event) => { setActiveTab((event as CustomEvent<SettingsSection>).detail); setMessage(""); };
    window.addEventListener("cheesecake-settings-section", navigate);
    return () => window.removeEventListener("cheesecake-settings-section", navigate);
  }, []);

  const tabs = [
    { id: "system" as const, label: "System", icon: Settings2 },
    { id: "updates" as const, label: "Updates", icon: ShieldCheck },
    { id: "display" as const, label: "Display & Monitors", icon: Monitor },
    { id: "account" as const, label: "Account", icon: User },
    { id: "wallpaper" as const, label: "Wallpaper", icon: Image },
    { id: "sounds" as const, label: "Sounds", icon: Bell },
  ];
  return (
    <div className="cheesecake-store settings-panel h-full min-h-0 flex flex-col bg-background text-foreground">
      <header className="px-5 py-4 border-b shrink-0"><h1 className="text-lg font-semibold">Control Panel</h1><p className="text-xs text-muted-foreground">Cheesecake OS · Blueberry Edition</p></header>
      <div className="settings-layout flex-1 min-h-0">
        <nav aria-label="Settings sections" className="settings-nav border-b p-2 flex gap-1 overflow-x-auto">
          {tabs.map(tab => <Button key={tab.id} variant={activeTab === tab.id ? "secondary" : "ghost"} size="sm" aria-pressed={activeTab === tab.id} onClick={() => { setActiveTab(tab.id); setMessage(""); }} className="justify-start text-xs shrink-0"><tab.icon />{tab.label}</Button>)}
        </nav>
        <main className="min-w-0 overflow-auto p-5">
          {activeTab === "system" && <SystemSettings />}
          {activeTab === "updates" && <UpdateSettings />}
          {activeTab === "display" && <DisplaySettings />}
          {activeTab === "account" && <div className="space-y-5">
            <h2 className="text-lg font-semibold">Account</h2>
            <div className="flex items-center gap-3 border-b pb-4"><User className="size-8 text-primary shrink-0" /><div className="min-w-0"><p className="text-sm font-semibold break-all">{user ? user.email : "Not signed in"}</p><p className="text-xs text-muted-foreground">{user ? "Signed in" : "Open User Account to sign in"}</p></div></div>
            {user && <form onSubmit={handlePasswordChange} className="space-y-3"><label htmlFor="newPassword" className="text-xs font-semibold">Change password</label><Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" placeholder="New password" required minLength={6} /><Button type="submit" size="sm">Update Password</Button></form>}
          </div>}
          {activeTab === "wallpaper" && <div className="space-y-4">
            <h2 className="text-lg font-semibold">Wallpaper</h2><h3 className="text-xs font-semibold">Blueberry Collection</h3>
            <div className="grid grid-cols-2 gap-2">
              {wallpaperPresets.map(p => <Button key={p.id} aria-label={p.name} aria-pressed={wallpaper === p.value} variant="outline" onClick={() => { setWallpaper(p.value); setMessage(`Wallpaper set to ${p.name}.`); }} className={`h-auto p-1 flex flex-col items-stretch gap-1 min-w-0 ${wallpaper === p.value ? "ring-2 ring-primary" : ""}`}><div className="w-full aspect-video rounded" style={{ backgroundImage: toBackgroundImage(p.value), backgroundSize: "cover", backgroundPosition: "center" }} /><span className="text-[10px] truncate">{p.name}</span></Button>)}
            </div>
            <h3 className="text-xs font-semibold">Custom Background</h3>
            <Input type="file" accept="image/*" aria-label="Upload wallpaper" onChange={handleWallpaperUpload} className="text-xs" />
            <Button variant="outline" size="sm" onClick={handleResetWallpaper}>Reset to Default</Button>
          </div>}
          {activeTab === "sounds" && <SoundsTab />}
          {message && <p role="status" className="text-xs mt-3 text-primary">{message}</p>}
        </main>
      </div>
      <footer className="border-t px-5 py-2 text-[10px] text-muted-foreground shrink-0">System preferences are saved on this device. Account and wallpaper settings remain separate.</footer>
    </div>
  );
};

export default ControlPanel;

const SoundsTab = () => {
  const [on, setOn] = useState(soundsEnabled());
  return <div className="space-y-4"><h2 className="text-lg font-semibold">Cheesecake Chimes</h2><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={on} onChange={e => { setOn(e.target.checked); setSoundsEnabled(e.target.checked); }} />Play system sounds</label><p className="text-xs text-muted-foreground">Sounds follow the taskbar volume and mute settings.</p><div className="grid grid-cols-2 gap-2">{(Object.keys(SOUND_LABELS) as SoundName[]).map(s => <Button key={s} variant="secondary" size="sm" onClick={() => playSound(s, true)} className="text-xs">{SOUND_LABELS[s]} <span>▶</span></Button>)}</div></div>;
};
