import { useRef, useState } from "react";
import { hexToRgb, rgbToHsl, rgbToOklch, formatOklch, nearestColorName } from "../colorEngine";
import { useSwatchMenu } from "../ContextMenuProvider";
import { useColorStore } from "../store";
import ColorPicker from "./ColorPicker";

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
  const { open } = useSwatchMenu();
  const { setPickedColor, previewColor } = useColorStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const swatchRef = useRef<HTMLDivElement>(null);

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const oklch = rgbToOklch(rgb);
  const colorName = nearestColorName(hex);

  const hexDisplay = hex.toUpperCase();
  const rgbDisplay = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  const hslDisplay = `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
  const oklchDisplay = formatOklch(oklch);

  // CSS-formatted copy values
  const rgbCopy = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslCopy = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <div className="flex gap-3 px-3 py-3 border-b border-vscode-border">
      {/* Large swatch */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div
          ref={swatchRef}
          className="w-16 h-16 rounded border border-vscode-border cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: hex }}
          onClick={() => setPickerOpen((v) => !v)}
          onContextMenu={(e) => { e.preventDefault(); open(hex, e.clientX, e.clientY); }}
          title="Click to open colour picker"
        />
        <span className="text-[9px] text-vscode-muted leading-none truncate w-16 text-center">
          {colorName}
        </span>
      </div>

      {/* Readout rows */}
      <div className="flex-1 flex flex-col justify-center -ml-3">
        <ReadoutRow label="Hex"   value={hexDisplay}   copyValue={hexDisplay} />
        <ReadoutRow label="RGB"   value={rgbDisplay}   copyValue={rgbCopy} />
        <ReadoutRow label="HSL"   value={hslDisplay}   copyValue={hslCopy} />
        <ReadoutRow label="OKLCH" value={oklchDisplay} copyValue={oklchDisplay} />
      </div>

      {/* Custom colour picker popover */}
      {pickerOpen && swatchRef.current && (
        <ColorPicker
          hex={hex}
          anchorEl={swatchRef.current}
          onChange={setPickedColor}
          onPreview={previewColor}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
