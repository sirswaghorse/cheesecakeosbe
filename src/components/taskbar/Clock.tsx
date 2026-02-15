import { useEffect, useState } from "react";

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="text-xs text-white/80 px-3 py-1 border-l" style={{ borderColor: "hsl(210 40% 35% / 0.4)" }}>
      {formatted}
    </div>
  );
};

export default Clock;
