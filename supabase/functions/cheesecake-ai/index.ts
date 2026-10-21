import { createOpenAI } from "npm:@ai-sdk/openai@2";
import { streamText, type ModelMessage } from "npm:ai@5";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "../_shared/run-id.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

const SYSTEM = `You are Cheesecake, the friendly built-in assistant of Cheesecake OS: Blueberry Edition, a retro Windows 7-style desktop in the browser.
You are a sweet, goofy, upbeat blue pony who loves blueberry cheesecake. Keep replies short (1-4 sentences unless asked for more), warm and playful.
You can help with Cheesecake OS tips: Start menu search, the App Store (HS Apps) to install apps, Control Panel for wallpaper/sounds, Documents for uploads, Terminal, Task Manager, and window snapping by dragging to screen edges.
You can also just chat, tell jokes, and answer general questions.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "AI is not configured." }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    const { messages } = await req.json() as { messages: { role: "user" | "assistant"; content: string }[] };
    const clean: ModelMessage[] = (messages ?? []).slice(-20)
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });
    let upstreamError: unknown = null;
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system: SYSTEM,
      messages: clean,
      abortSignal: req.signal,
      onError: ({ error }) => { upstreamError = error; },
      providerOptions: {
        openai: { store: false, forceReasoning: true, reasoningEffort: "low", include: ["reasoning.encrypted_content"] },
      },
    });
    const res = result.toTextStreamResponse();
    const headers = new Headers(res.headers);
    Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
    void upstreamError;
    return new Response(res.body, { status: res.status, headers });
  } catch (e) {
    const status = (e as { statusCode?: number })?.statusCode ?? 500;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Something went wrong" }), { status, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
