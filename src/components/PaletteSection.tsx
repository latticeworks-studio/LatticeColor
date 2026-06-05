import { useState } from "react";
import {
  PaletteType,
  VariantType,
  PALETTE_LABELS,
  VARIANT_LABELS,
  MATERIAL_STEPS,
  generatePalette,
  applyVariant,
} from "../colorEngine";
import { useColorStore } from "../store";
import { useSwatchMenu } from "../ContextMenuProvider";
import Tooltip from "./Tooltip";

const PALETTE_TYPES: PaletteType[] = ["complementary", "analogous", "triadic", "tetradic", "monochrome", "material"];

const PALETTE_TIPS: Record<PaletteType, { title: string; body: string }> = {
  complementary: {
    title: "Complementary",
    body: "The colour directly opposite on the wheel (+180°). Maximum contrast — great for bold, high-impact pairings.",
  },
  analogous: {
    title: "Analogous",
    body: "Neighbours on the wheel (±15°, ±30°). Natural and harmonious — like the colours in a sunset or forest.",
  },
  triadic: {
    title: "Triadic",
    body: "Three colours evenly spaced (+120°, +240°). Vibrant yet balanced — pick one dominant, two as accents.",
  },
  tetradic: {
    title: "Tetradic",
    body: "Four colours at 90° intervals forming a rectangle. Rich and complex — works best with one hue leading.",
  },
  monochrome: {
    title: "Monochromatic",
    body: "Same hue, five lightness steps. Refined and cohesive — easy to layer without ever clashing.",
  },
  material: {
    title: "Material Tonal",
    body: "Material Design's 50–900 tonal scale. Ten steps of one hue for building complete, accessible UI systems.",
  },
};
const VARIANTS: VariantType[] = ["darker", "lighter", "muted", "vibrant", "random"];

interface SwatchProps {
  hex: string;
  label?: string;
  size?: "sm" | "md";
  onClick?: () => void;
}

function Swatch({ hex, label, size = "md", onClick }: SwatchProps) {
  const { open } = useSwatchMenu();
  const dim = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        className={`${dim} rounded-sm border border-vscode-border hover:scale-110 transition-transform flex-shrink-0`}
        style={{ backgroundColor: hex }}
        onClick={onClick}
        onContextMenu={(e) => { e.preventDefault(); open(hex, e.clientX, e.clientY); }}
        title={hex}
      />
      {label && (
        <span className="text-[8px] text-vscode-muted leading-none">{label}</span>
      )}
    </div>
  );
}

interface Props {
  baseHex: string;
}

export default function PaletteSection({ baseHex }: Props) {
  const [paletteType, setPaletteType] = useState<PaletteType>("analogous");
  const [activeVariant, setActiveVariant] = useState<VariantType | null>(null);
  const { setPickedColor } = useColorStore();

  const palette = generatePalette(baseHex, paletteType);
  const variantSwatches = activeVariant ? applyVariant(baseHex, activeVariant) : null;
  const isMaterial = paletteType === "material";

  return (
    <div className="flex flex-col gap-0 border-b border-vscode-border">
      {/* Palette type tabs */}
      <div className="flex items-center border-b border-vscode-border overflow-x-auto">
        {PALETTE_TYPES.map((type) => (
          <Tooltip key={type} title={PALETTE_TIPS[type].title} body={PALETTE_TIPS[type].body}>
            <button
              onClick={() => setPaletteType(type)}
              className={`px-3 py-1.5 text-[10px] tracking-wide flex-shrink-0 transition-colors border-b-2 ${
                paletteType === type
                  ? "text-vscode-accent border-vscode-accent"
                  : "text-vscode-muted border-transparent hover:text-vscode-text"
              }`}
            >
              {PALETTE_LABELS[type]}
            </button>
          </Tooltip>
        ))}
      </div>

      {/* Harmony swatches */}
      <div className="flex items-end gap-1.5 px-3 py-2.5 flex-wrap">
        {palette.map((hex, i) => (
          <Swatch
            key={i}
            hex={hex}
            label={isMaterial ? MATERIAL_STEPS[i] : undefined}
            size={isMaterial ? "sm" : "md"}
            onClick={() => setPickedColor(hex)}
          />
        ))}
      </div>

      {/* Variant buttons */}
      <div className="flex items-center gap-1 px-3 pb-2 border-t border-vscode-border pt-2">
        {VARIANTS.map((v) => (
          <button
            key={v}
            onClick={() => setActiveVariant(activeVariant === v ? null : v)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
              activeVariant === v
                ? "border-vscode-accent text-vscode-accent"
                : "border-vscode-border text-vscode-muted hover:border-vscode-muted hover:text-vscode-text"
            }`}
          >
            {VARIANT_LABELS[v]}
          </button>
        ))}
      </div>

      {/* Variant swatches */}
      {variantSwatches && (
        <div className="flex items-center gap-1.5 px-3 pb-2.5">
          {variantSwatches.map((hex, i) => (
            <Swatch key={i} hex={hex} onClick={() => setPickedColor(hex)} />
          ))}
        </div>
      )}
    </div>
  );
}
