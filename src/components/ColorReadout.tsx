import { useState } from "react";
import { hexToRgb, rgbToHsl, rgbToOklch, formatOklch } from "../colorEngine";

interface Props {
  hex: string;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      onClick={copy}
      className="text-vscode-muted hover:text-vscode-accent transition-colors flex-shrink-0 text-[10px] tracking-wide"
      title={`Copy ${label}`}
    >
      {copied ? "✓" : "copy"}
    </button>
  );
}

function ReadoutRow({ label, value, copyValue }: { label: string; value: string; copyValue: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1">
      <span className="text-vscode-muted text-[10px] w-10 flex-shrink-0 tracking-wider uppercase">
        {label}
      </span>
      <span className="flex-1 text-vscode-text text-xs font-mono truncate">{value}</span>
      <CopyButton value={copyValue} label={label} />
    </div>
  );
}

export default function ColorReadout({ hex }: Props) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const oklch = rgbToOklch(rgb);

  const hexDisplay = hex.toUpperCase();
  const rgbDisplay = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  const hslDisplay = `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
  const oklchDisplay = formatOklch(oklch);

  return (
    <div className="flex gap-3 px-3 py-3 border-b border-vscode-border">
      {/* Large swatch */}
      <div
        className="w-16 h-16 rounded flex-shrink-0 border border-vscode-border"
        style={{ backgroundColor: hex }}
      />

      {/* Readout rows */}
      <div className="flex-1 flex flex-col justify-center -ml-3">
        <ReadoutRow label="Hex" value={hexDisplay} copyValue={hexDisplay} />
        <ReadoutRow label="RGB" value={rgbDisplay} copyValue={rgbDisplay} />
        <ReadoutRow label="HSL" value={hslDisplay} copyValue={hslDisplay} />
        <ReadoutRow label="OKLCH" value={oklchDisplay} copyValue={oklchDisplay} />
      </div>
    </div>
  );
}
