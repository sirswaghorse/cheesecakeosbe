const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { ...cors, "Content-Type": "application/json" } });

// Same voice as Cheesecake's Arcade: Gemini TTS, "Leda", cheerful young woman.
const TTS_MODEL = "google/gemini-3.1-flash-tts-preview";
const TTS_VOICE = "Leda";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json(500, "AI is not configured.");
  const { text } = (await req.json().catch(() => ({}))) as { text?: string };
  if (typeof text !== "string" || !text.trim()) return json(400, "Nothing to say");

  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: TTS_MODEL,
      contents: [{ role: "user", parts: [{ text: `Say in a cheerful, playful, friendly young woman's voice: ${text.slice(0, 2500)}` }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: TTS_VOICE } } },
      },
      stream_format: "audio",
    }),
    signal: req.signal,
  });
  if (!upstream.ok) {
    console.error("TTS failed", upstream.status, await upstream.text());
    return json(upstream.status, upstream.status === 402 ? "Out of AI credits." : upstream.status === 429 ? "Too many requests, try again shortly." : "Voice is unavailable right now.");
  }
  return new Response(upstream.body, { headers: { ...cors, "Content-Type": upstream.headers.get("content-type") ?? "audio/wav" } });
});
