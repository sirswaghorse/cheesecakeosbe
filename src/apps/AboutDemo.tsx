const AboutDemo = () => {
  return (
    <div className="h-full p-6 flex flex-col items-center justify-center text-center" style={{ background: "hsl(220 14% 96%)" }}>
      <div className="text-5xl mb-4">🖥️</div>
      <h2 className="text-lg font-bold mb-2" style={{ color: "hsl(210 20% 15%)" }}>
        Windows 7 Desktop Simulator
      </h2>
      <p className="text-sm mb-4 max-w-xs" style={{ color: "hsl(210 15% 35%)" }}>
        A browser-based retro desktop environment inspired by Windows 7's Aero theme.
        Built with React and Tailwind CSS.
      </p>
      <div className="text-xs space-y-1" style={{ color: "hsl(210 10% 50%)" }}>
        <p>✓ Draggable windows with focus management</p>
        <p>✓ Working Start menu and taskbar</p>
        <p>✓ Minimize, maximize, and close</p>
        <p>✓ Aero glass visual effects</p>
      </div>
      <div className="mt-6 text-xs" style={{ color: "hsl(210 10% 60%)" }}>
        Version 1.0 — Made with ❤️
      </div>
    </div>
  );
};

export default AboutDemo;
