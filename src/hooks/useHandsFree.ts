import { useEffect, useRef, useState } from "react";

/**
 * Hands-free mic: listens continuously, detects when you start/stop talking
 * (simple volume-based voice detection) and hands each finished phrase to onUtterance.
 * `paused` mutes listening (e.g. while Cheesecake is speaking) so she doesn't hear herself.
 */
export function useHandsFree(enabled: boolean, paused: boolean, onUtterance: (audio: Blob) => void) {
  const [hearing, setHearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const cbRef = useRef(onUtterance);
  cbRef.current = onUtterance;

  useEffect(() => {
    if (!enabled) return;
    let stream: MediaStream | null = null, ctx: AudioContext | null = null, raf = 0, cancelled = false;
    let rec: MediaRecorder | null = null, chunks: Blob[] = [], speechStart = 0, lastLoud = 0;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      } catch { setError("Microphone access was blocked."); return; }
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      setError(null);
      ctx = new AudioContext();
      const an = ctx.createAnalyser(); an.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(an);
      const data = new Float32Array(an.fftSize);
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
      let noise = 0.01;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        an.getFloatTimeDomainData(data);
        let sum = 0; for (const v of data) sum += v * v;
        const rms = Math.sqrt(sum / data.length), now = performance.now();
        if (pausedRef.current) {
          if (rec) { rec.onstop = null; rec.stop(); rec = null; setHearing(false); }
          return;
        }
        const loud = rms > Math.max(0.02, noise * 3);
        if (!rec && !loud) noise = noise * 0.98 + rms * 0.02;
        if (loud) lastLoud = now;
        if (!rec && loud) {
          chunks = []; speechStart = now;
          rec = new MediaRecorder(stream!, mime ? { mimeType: mime } : undefined);
          rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
          const started = speechStart;
          rec.onstop = () => {
            if (lastLoud - started > 400) cbRef.current(new Blob(chunks, { type: "audio/webm" }));
          };
          rec.start(250); setHearing(true);
        } else if (rec && (now - lastLoud > 1100 || now - speechStart > 30000)) {
          rec.stop(); rec = null; setHearing(false);
        }
      };
      loop();
    })();
    return () => {
      cancelled = true; cancelAnimationFrame(raf);
      if (rec) { rec.onstop = null; rec.stop(); }
      stream?.getTracks().forEach((t) => t.stop()); ctx?.close(); setHearing(false);
    };
  }, [enabled]);

  return { hearing, error };
}
