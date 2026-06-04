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

const PALETTE_TYPES: PaletteType[] = ["complementary", "analogous", "triadic", "tetradic", "monochrome", "material"];
const VARIANTS: VariantType[] = ["darker", "lighter", "muted", "vibrant", "random"];

interface SwatchProps {
  hex: string;
  label?: string;
  size?: "sm" | "md";
  onClick?: () => void;
}

function Swatch({ hex, label, size = "md", onClick }: SwatchProps) {
  const dim = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        className={`${dim} rounded-sm border border-vscode-border hover:scale-110 transition-transform flex-shrink-0`}
        style={{ backgroundColor: hex }}
        onClick={onClick}
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
          <button
            key={type}
            onClick={() => setPaletteType(type)}
            className={`px-3 py-1.5 text-[10px] tracking-wide flex-shrink-0 transition-colors border-b-2 ${
              paletteType === type
                ? "text-vscode-accent border-vscode-accent"
                : "text-vscode-muted border-transparent hover:text-vscode-text"
            }`}
          >
            {PALETTE_LABELS[type]}
          </button>
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
