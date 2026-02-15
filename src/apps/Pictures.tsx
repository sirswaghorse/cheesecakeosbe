const colors = [
  { name: "Sunset", color: "hsl(20 90% 55%)" },
  { name: "Ocean", color: "hsl(200 80% 50%)" },
  { name: "Forest", color: "hsl(140 60% 40%)" },
  { name: "Lavender", color: "hsl(270 50% 60%)" },
  { name: "Cherry", color: "hsl(340 75% 50%)" },
  { name: "Gold", color: "hsl(45 90% 55%)" },
  { name: "Sky", color: "hsl(195 80% 65%)" },
  { name: "Mint", color: "hsl(160 50% 55%)" },
  { name: "Coral", color: "hsl(10 80% 60%)" },
];

const Pictures = () => {
  return (
    <div className="h-full p-4 overflow-auto" style={{ background: "hsl(220 14% 96%)" }}>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: "hsl(210 15% 85%)" }}>
        <span className="text-lg">🖼️</span>
        <span className="text-sm font-medium" style={{ color: "hsl(210 20% 15%)" }}>My Pictures</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {colors.map((item) => (
          <div key={item.name} className="flex flex-col items-center gap-1 cursor-pointer group">
            <div
              className="w-full aspect-square rounded shadow-sm group-hover:shadow-md transition-shadow"
              style={{ background: item.color }}
            />
            <span className="text-xs" style={{ color: "hsl(210 15% 35%)" }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pictures;
