import { useEffect, useState } from "react";
import { FolderOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { platformBridge } from "@/lib/platformBridge";

export default function NativeDocuments() {
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const open = async () => {
    setBusy(true);
    setError("");
    try { await platformBridge.openFolder("documents"); }
    catch { setError("Could not open Documents. Check that your Linux Documents folder and system file manager are available."); }
    finally { setBusy(false); }
  };
  useEffect(() => { void open(); }, []);
  return <div className="cheesecake-store h-full bg-background text-foreground flex flex-col items-center justify-center gap-4 p-6 text-center">
    <FolderOpen className="size-12 text-primary" />
    <h2 className="text-lg font-semibold">Documents</h2>
    <p role="status" className="text-sm text-muted-foreground max-w-sm">{busy ? "Opening Documents…" : error || "Documents opened in your system file manager."}</p>
    <Button disabled={busy} onClick={open}><RefreshCw />Open Documents</Button>
  </div>;
}