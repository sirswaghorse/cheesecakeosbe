import { useState } from "react";

const Notepad = () => {
  const [text, setText] = useState(
    "Welcome to Notepad!\n\nThis is a simple text editor inside your retro Windows 7 desktop.\nFeel free to type anything here...\n\nTip: Try dragging this window around!"
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex gap-4 px-2 py-1 text-xs border-b" style={{ color: "hsl(210 20% 15%)", borderColor: "hsl(210 15% 85%)" }}>
        <span className="cursor-pointer hover:underline">File</span>
        <span className="cursor-pointer hover:underline">Edit</span>
        <span className="cursor-pointer hover:underline">Format</span>
        <span className="cursor-pointer hover:underline">Help</span>
      </div>
      <textarea
        className="flex-1 p-2 resize-none outline-none font-mono text-sm"
        style={{ color: "hsl(210 20% 10%)" }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
};

export default Notepad;
