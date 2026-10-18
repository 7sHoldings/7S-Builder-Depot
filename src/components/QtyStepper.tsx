"use client";

export function QtyStepper({
  value,
  onChange,
  label,
  min = 1,
  max = 999,
  size = "lg",
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  min?: number;
  max?: number;
  size?: "md" | "lg";
}) {
  const h = size === "lg" ? "h-[52px]" : "h-11";
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className="flex items-center border border-line-strong bg-surface" role="group" aria-label={label}>
      <button type="button" aria-label="Decrease" disabled={value <= min} onClick={() => onChange(clamp(value - 1))} className={`${h} w-11 text-xl disabled:text-line-strong`}>
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        className={`${h} w-14 border-x border-line text-center text-lg font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
      />
      <button type="button" aria-label="Increase" disabled={value >= max} onClick={() => onChange(clamp(value + 1))} className={`${h} w-11 text-xl disabled:text-line-strong`}>
        +
      </button>
    </div>
  );
}
