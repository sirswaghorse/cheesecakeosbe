import { useEffect, useState } from "react";
import CalendarFlyout from "./CalendarFlyout";

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <CalendarFlyout>
      <button
        aria-label="Open calendar"
        title="Open calendar"
        className="text-xs text-white/80 px-3 py-1 border-l hover:bg-primary/30 transition-colors rounded-sm"
        style={{ borderColor: "hsl(210 40% 35% / 0.4)" }}
      >
        {formatted}
      </button>
    </CalendarFlyout>
  );
};

export default Clock;
