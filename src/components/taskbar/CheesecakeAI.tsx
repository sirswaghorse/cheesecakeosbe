import { useEffect, useRef, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { playSound } from "@/lib/sounds";
import avatar from "@/assets/cheesecake-ai.png.asset.json";

type Msg = { role: "user" | "assistant"; content: string };
const KEY = "cheesecake-ai-chat";
const PROMPTS = ["What can Cheesecake OS do?", "Tell me a joke", "Give me a desktop tip", "Recommend some music"];
const URL_ = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cheesecake-ai`;

const CheesecakeAI = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); }, [msgs]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs, open, busy]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setError(null); setInput("");
    const history: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch(URL_, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || (res.status === 429 ? "Cheesecake is busy, try again in a moment." : res.status === 402 ? "AI credits have run out." : "Cheesecake couldn't answer right now."));
      }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let acc = "";
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...history, { role: "assistant", content: acc }]);
      }
      if (!acc.trim()) throw new Error("Cheesecake didn't reply. Please try again.");
      playSound("notify" as never);
    } catch (e) {
      setMsgs(history);
      setInput(t);
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setBusy(false); }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button aria-label="Cheesecake AI" title="Cheesecake AI"
          className={`h-10 w-10 mx-1 shrink-0 rounded-md flex items-center justify-center transition-all hover:bg-primary/30 hover:-translate-y-0.5 ${open ? "win-taskbar-btn-active" : ""}`}>
          <img src={avatar.url} alt="" className="h-8 w-8 rounded-full object-cover bg-card" style={{ imageRendering: "pixelated" }} />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" sideOffset={10}
        className="win-glass w-[360px] max-w-[calc(100vw-16px)] p-0 rounded-lg border border-border/40 text-foreground z-[10000] overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
        <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border/30">
          <img src={avatar.url} alt="Cheesecake" className="h-10 w-10 rounded-full object-cover bg-card" style={{ imageRendering: "pixelated" }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Cheesecake AI</p>
            <p className="text-[11px] text-foreground/70 flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${busy ? "bg-accent animate-pulse" : "bg-accent"}`} />
              {busy ? "Thinking…" : "Online & ready to help"}
            </p>
          </div>
          {msgs.length > 0 && (
            <button aria-label="Clear chat" title="Clear chat" onClick={() => setMsgs([])} className="p-1.5 rounded hover:bg-primary/30">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="h-80 overflow-y-auto px-3 py-3 space-y-2 select-text">
          {msgs.length === 0 && (
            <div className="text-center text-xs text-foreground/75 pt-4">
              <p className="mb-3">Hi! I'm Cheesecake 🫐 Ask me anything about the OS — or just say hi!</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {PROMPTS.map((p) => (
                  <button key={p} onClick={() => send(p)} className="px-2.5 py-1 rounded-full border border-border/40 bg-primary/20 hover:bg-primary/40 text-[11px]">{p}</button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card text-card-foreground rounded-bl-sm"}`}>
                {m.content || <span className="opacity-60">…</span>}
              </div>
            </div>
          ))}
          {error && <p className="text-[11px] text-destructive-foreground bg-destructive/70 rounded px-2 py-1">{error}</p>}
          <div ref={endRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 p-2 border-t border-border/30">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Cheesecake…" disabled={busy}
            className="flex-1 h-9 px-3 rounded-full bg-card text-card-foreground text-xs outline-none focus:ring-2 focus:ring-ring" />
          <button type="submit" aria-label="Send" disabled={busy || !input.trim()} className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default CheesecakeAI;
