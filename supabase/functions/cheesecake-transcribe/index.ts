const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json(500, { error: "AI is not configured." });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !file.size || file.size > 10_000_000) return json(400, { error: "Invalid audio" });
  const type = file.type.startsWith("audio/") ? (file.type.split(";")[0] || "audio/webm") : "audio/webm";
  const out = new FormData();
  out.append("model", "openai/gpt-transcribe");
  out.append("file", new File([await file.arrayBuffer()], "speech.webm", { type }));
  out.append("response_format", "json");
  out.append("stream", "true");
  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
    method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: out, signal: req.signal,
  });
  if (!upstream.ok || !upstream.body) {
    console.error("STT failed", upstream.status, await upstream.text());
    return json(upstream.status, { error: upstream.status === 402 ? "Out of AI credits." : upstream.status === 429 ? "Too many requests, try again shortly." : "Couldn't hear that." });
  }
  const reader = upstream.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "", text = "", done = "";
  for (;;) {
    const { value, done: end } = await reader.read();
    if (end) break;
    buf += value;
    const lines = buf.split("\n"); buf = lines.pop() ?? "";
    for (const l of lines) {
      if (!l.startsWith("data:")) continue;
      const d = l.slice(5).trim();
      if (!d || d === "[DONE]") continue;
      try {
        const ev = JSON.parse(d) as { type?: string; delta?: string; text?: string };
        if (ev.type === "transcript.text.delta" && ev.delta) text += ev.delta;
        if (ev.type === "transcript.text.done" && ev.text) done = ev.text;
      } catch { /* ignore */ }
    }
  }
  return json(200, { text: (done || text).trim() });
});
