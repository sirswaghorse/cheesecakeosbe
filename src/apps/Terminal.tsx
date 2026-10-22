import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLocalUser } from "@/lib/localUser";

type Line = { text: string; kind?: "cmd" | "err" | "art" };

const FS: Record<string, Record<string, string>> = {
  "/home": { "welcome.txt": "Welcome to Cheesecake OS: Blueberry Edition! Type 'help' to begin." },
  "/docs": { "readme.txt": "Your uploaded files live in the Documents app." },
  "/system": { "version.txt": "Cheesecake OS 1.0 Blueberry Edition", "kernel.txt": "cheesecake-linux 6.8.0-blueberry" },
};
const bootTime = Date.now();

const ART = [
  "      .--------.     ",
  "    .'  o  o  o '.   ",
  "   /  o  o  o  o  \\  ",
  "  |~~~~~~~~~~~~~~~~| ",
  "  |   CHEESECAKE   | ",
  "  |   blueberry    | ",
  "  '----------------' ",
];

export default function Terminal() {
  const user = useLocalUser().username;
  const [cwd, setCwd] = useState("/home");
  const [lines, setLines] = useState<Line[]>([{ text: "Cheesecake OS Terminal — type 'help' for commands." }]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ block: "end" }), [lines]);

  const neofetch = (): Line[] => {
    const mins = Math.floor((Date.now() - bootTime) / 60000);
    const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
    const info = [
      `${user}@cheesecake-os`,
      "--------------------",
      "OS: Cheesecake OS Blueberry Edition",
      "Kernel: cheesecake-linux 6.8.0-blueberry",
      `Uptime: ${mins} min`,
      "Shell: cheesesh 1.0",
      "DE: Aero Blueberry",
      "Theme: Frosted Lavender Berry",
      `Resolution: ${window.innerWidth}x${window.innerHeight}`,
      `Memory: ${mem ? Math.round(mem.usedJSHeapSize / 1048576) + " MiB used" : "512 MiB / 4096 MiB"}`,
    ];
    const n = Math.max(ART.length, info.length);
    return Array.from({ length: n }, (_, i) => ({ text: (ART[i] ?? " ".repeat(21)) + "  " + (info[i] ?? ""), kind: "art" as const }));
  };

  const run = (raw: string): Line[] | "clear" => {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    switch (cmd) {
      case "": return [];
      case "help": return ["help, neofetch, cheesefetch, uname [-a], whoami, pwd, ls, cd <dir>, cat <file>, echo <text>, date, history, clear"].map((text) => ({ text }));
      case "neofetch": case "cheesefetch": return neofetch();
      case "uname": return [{ text: args[0] === "-a" ? "Cheesecake 6.8.0-blueberry #1 SMP x86_64 GNU/Linux" : "Cheesecake" }];
      case "whoami": return [{ text: user }];
      case "pwd": return [{ text: cwd }];
      case "ls": {
        const dir = cwd === "/" ? null : FS[cwd];
        return [{ text: dir ? Object.keys(dir).join("  ") : Object.keys(FS).map((d) => d.slice(1)).join("  ") }];
      }
      case "cd": {
        const target = !arg || arg === "~" ? "/home" : arg === ".." || arg === "/" ? "/" : arg.startsWith("/") ? arg : `/${arg}`;
        if (target !== "/" && !FS[target]) return [{ text: `cd: ${arg}: No such directory`, kind: "err" }];
        setCwd(target);
        return [];
      }
      case "cat": {
        const content = FS[cwd]?.[arg];
        return content ? [{ text: content }] : [{ text: `cat: ${arg || "missing file"}: No such file`, kind: "err" }];
      }
      case "echo": return [{ text: arg }];
      case "date": return [{ text: new Date().toString() }];
      case "history": return history.map((h, i) => ({ text: `${i + 1}  ${h}` }));
      case "clear": return "clear";
      case "sudo": return [{ text: "Nice try. No cheesecake for you.", kind: "err" }];
      case "reboot": case "shutdown": return [{ text: "Use the power button in the Start menu to shut down.", kind: "err" }];
      default: return [{ text: `${cmd}: command not found`, kind: "err" }];
    }
  };

  const prompt = `${user}@cheesecake-os:${cwd === "/home" ? "~" : cwd}$`;

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const out = run(input);
      if (input.trim()) setHistory((h) => [...h, input]);
      setHIdx(-1);
      setLines((l) => (out === "clear" ? [] : [...l, { text: `${prompt} ${input}`, kind: "cmd" }, ...out]));
      setInput("");
    } else if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const i = hIdx < 0 ? history.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(i); setInput(history[i]);
    } else if (e.key === "ArrowDown" && hIdx >= 0) {
      e.preventDefault();
      const i = hIdx + 1;
      if (i >= history.length) { setHIdx(-1); setInput(""); } else { setHIdx(i); setInput(history[i]); }
    }
  };

  return (
    <div className="h-full overflow-auto bg-slate-950 p-3 font-mono text-xs text-indigo-100" onClick={() => inputRef.current?.focus()}>
      {lines.map((l, i) => (
        <pre key={i} className={`whitespace-pre-wrap ${l.kind === "err" ? "text-rose-300" : l.kind === "art" ? "text-sky-300" : l.kind === "cmd" ? "text-indigo-300" : ""}`}>{l.text}</pre>
      ))}
      <div className="flex gap-2">
        <span className="shrink-0 text-indigo-300">{prompt}</span>
        <input ref={inputRef} autoFocus aria-label="Terminal input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey}
          className="flex-1 bg-transparent text-indigo-100 caret-sky-300 outline-none" spellCheck={false} autoCapitalize="off" autoComplete="off" />
      </div>
      <div ref={endRef} />
    </div>
  );
}
