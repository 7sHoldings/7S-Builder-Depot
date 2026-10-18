import type { Visual } from "@/lib/catalog";

// Drawn product illustrations, used until real product photos are added.
// To use photos instead, replace <ProductVisual> with next/image in ProductCard and ProductDetail.

export function ProductVisual({
  visual,
  label,
  className = "",
  colorOverride,
}: {
  visual: Visual;
  label: string;
  className?: string;
  colorOverride?: string;
}) {
  return (
    <div role="img" aria-label={label} className={`relative flex items-center justify-center overflow-hidden ${className}`} style={surface(visual, colorOverride)}>
      {visual.kind === "door" && <Door color={colorOverride ?? visual.color} panels={visual.panels} />}
      {visual.kind === "patio" && <Patio />}
      {visual.kind === "window" && <Window panes={visual.panes} />}
    </div>
  );
}

function surface(v: Visual, override?: string): React.CSSProperties {
  switch (v.kind) {
    case "plank": {
      const c = override ?? v.color;
      return {
        backgroundColor: c,
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent 0 46px, rgba(0,0,0,0.10) 46px 48px), repeating-linear-gradient(0deg, transparent 0 140px, rgba(0,0,0,0.06) 140px 142px)",
      };
    }
    case "tile": {
      const s = v.size === "large" ? 64 : 30;
      return {
        backgroundColor: v.color,
        backgroundImage: `linear-gradient(${v.grout} 2px, transparent 2px), linear-gradient(90deg, ${v.grout} 2px, transparent 2px)`,
        backgroundSize: `${v.size === "large" ? s * 2 : s * 2}px ${s}px`,
      };
    }
    case "sheet":
      return {
        backgroundColor: v.color,
        backgroundImage:
          "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.35) 0 6px, transparent 7px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.35) 0 6px, transparent 7px)",
        backgroundSize: "32px 32px",
      };
    default:
      return { backgroundColor: "#efede7" };
  }
}

function Door({ color, panels }: { color: string; panels: boolean }) {
  return (
    <div className="relative flex h-[78%] aspect-[9/20] flex-col gap-[6%] border-[6px] border-[#6b6f73] p-[10%]" style={{ backgroundColor: color }}>
      {panels ? (
        <>
          <span className="flex-1 border border-black/15" />
          <span className="flex-[1.6] border border-black/15" />
          <span className="flex-[1.6] border border-black/15" />
        </>
      ) : (
        <span className="flex-1 border border-black/15" />
      )}
      <span className="absolute right-[12%] top-1/2 h-2 w-2 rounded-full bg-[#6b6f73]" />
    </div>
  );
}

function Patio() {
  return (
    <div className="grid h-[72%] aspect-[18/20] grid-cols-2 gap-[4px] border-[6px] border-[#6b6f73] bg-[#6b6f73]">
      <span className="bg-[#c9dce3]" />
      <span className="bg-[#d6e6eb]" />
    </div>
  );
}

function Window({ panes }: { panes: 1 | 2 | 4 }) {
  const grid = panes === 4 ? "grid-cols-2 grid-rows-2" : panes === 2 ? "grid-rows-2" : "";
  return (
    <div className={`grid h-[66%] aspect-[3/4] gap-[4px] border-[7px] border-[#f2f1ee] bg-[#f2f1ee] shadow-[0_0_0_1px_#c9c5bb] ${grid}`}>
      {Array.from({ length: panes }, (_, i) => (
        <span key={i} className="bg-[#c9dce3]" />
      ))}
    </div>
  );
}
