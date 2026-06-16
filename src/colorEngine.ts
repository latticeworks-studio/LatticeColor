export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }
export interface OKLCH { l: number; c: number; h: number }

// ── Conversions ───────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = d / (l > 0.5 ? 2 - max - min : max + min);
  let h = 0;
  switch (max) {
    case R: h = ((G - B) / d + (G < B ? 6 : 0)) / 6; break;
    case G: h = ((B - R) / d + 2) / 6; break;
    case B: h = ((R - G) / d + 4) / 6; break;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const H = h / 360, S = s / 100, L = l / 100;
  if (S === 0) {
    const v = Math.round(L * 255);
    return { r: v, g: v, b: v };
  }
  const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
  const p = 2 * L - q;
  return {
    r: Math.round(hueToRgb(p, q, H + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, H) * 255),
    b: Math.round(hueToRgb(p, q, H - 1 / 3) * 255),
  };
}

function linearize(channel: number): number {
  const x = channel / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

export function rgbToOklch({ r, g, b }: RGB): OKLCH {
  const lr = linearize(r), lg = linearize(g), lb = linearize(b);

  // linear sRGB → XYZ D65
  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb;
  const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;

  // XYZ → OKLab (Björn Ottosson)
  const lms_l = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const lms_m = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const lms_s = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  const L = 0.2104542553 * lms_l + 0.7936177850 * lms_m - 0.0040720468 * lms_s;
  const A = 1.9779984951 * lms_l - 2.4285922050 * lms_m + 0.4505937099 * lms_s;
  const B2 = 0.0259040371 * lms_l + 0.7827717662 * lms_m - 0.8086757660 * lms_s;

  const C = Math.sqrt(A * A + B2 * B2);
  const H = ((Math.atan2(B2, A) * (180 / Math.PI)) + 360) % 360;

  return {
    l: Math.round(L * 1000) / 1000,
    c: Math.round(C * 1000) / 1000,
    h: Math.round(H * 10) / 10,
  };
}

export function formatOklch({ l, c, h }: OKLCH): string {
  return `oklch(${l} ${c} ${h})`;
}

// ── Named colour lookup ───────────────────────────────────────────────────────

const CSS_NAMED_COLORS: [string, string][] = [
  ["AliceBlue","#F0F8FF"],["AntiqueWhite","#FAEBD7"],["Aqua","#00FFFF"],
  ["Aquamarine","#7FFFD4"],["Azure","#F0FFFF"],["Beige","#F5F5DC"],
  ["Bisque","#FFE4C4"],["Black","#000000"],["BlanchedAlmond","#FFEBCD"],
  ["Blue","#0000FF"],["BlueViolet","#8A2BE2"],["Brown","#A52A2A"],
  ["BurlyWood","#DEB887"],["CadetBlue","#5F9EA0"],["Chartreuse","#7FFF00"],
  ["Chocolate","#D2691E"],["Coral","#FF7F50"],["CornflowerBlue","#6495ED"],
  ["Cornsilk","#FFF8DC"],["Crimson","#DC143C"],["Cyan","#00FFFF"],
  ["DarkBlue","#00008B"],["DarkCyan","#008B8B"],["DarkGoldenrod","#B8860B"],
  ["DarkGray","#A9A9A9"],["DarkGreen","#006400"],["DarkKhaki","#BDB76B"],
  ["DarkMagenta","#8B008B"],["DarkOliveGreen","#556B2F"],["DarkOrange","#FF8C00"],
  ["DarkOrchid","#9932CC"],["DarkRed","#8B0000"],["DarkSalmon","#E9967A"],
  ["DarkSeaGreen","#8FBC8F"],["DarkSlateBlue","#483D8B"],["DarkSlateGray","#2F4F4F"],
  ["DarkTurquoise","#00CED1"],["DarkViolet","#9400D3"],["DeepPink","#FF1493"],
  ["DeepSkyBlue","#00BFFF"],["DimGray","#696969"],["DodgerBlue","#1E90FF"],
  ["Firebrick","#B22222"],["FloralWhite","#FFFAF0"],["ForestGreen","#228B22"],
  ["Fuchsia","#FF00FF"],["Gainsboro","#DCDCDC"],["GhostWhite","#F8F8FF"],
  ["Gold","#FFD700"],["Goldenrod","#DAA520"],["Gray","#808080"],
  ["Green","#008000"],["GreenYellow","#ADFF2F"],["Honeydew","#F0FFF0"],
  ["HotPink","#FF69B4"],["IndianRed","#CD5C5C"],["Indigo","#4B0082"],
  ["Ivory","#FFFFF0"],["Khaki","#F0E68C"],["Lavender","#E6E6FA"],
  ["LavenderBlush","#FFF0F5"],["LawnGreen","#7CFC00"],["LemonChiffon","#FFFACD"],
  ["LightBlue","#ADD8E6"],["LightCoral","#F08080"],["LightCyan","#E0FFFF"],
  ["LightGoldenrodYellow","#FAFAD2"],["LightGray","#D3D3D3"],["LightGreen","#90EE90"],
  ["LightPink","#FFB6C1"],["LightSalmon","#FFA07A"],["LightSeaGreen","#20B2AA"],
  ["LightSkyBlue","#87CEFA"],["LightSlateGray","#778899"],["LightSteelBlue","#B0C4DE"],
  ["LightYellow","#FFFFE0"],["Lime","#00FF00"],["LimeGreen","#32CD32"],
  ["Linen","#FAF0E6"],["Magenta","#FF00FF"],["Maroon","#800000"],
  ["MediumAquamarine","#66CDAA"],["MediumBlue","#0000CD"],["MediumOrchid","#BA55D3"],
  ["MediumPurple","#9370DB"],["MediumSeaGreen","#3CB371"],["MediumSlateBlue","#7B68EE"],
  ["MediumSpringGreen","#00FA9A"],["MediumTurquoise","#48D1CC"],["MediumVioletRed","#C71585"],
  ["MidnightBlue","#191970"],["MintCream","#F5FFFA"],["MistyRose","#FFE4E1"],
  ["Moccasin","#FFE4B5"],["NavajoWhite","#FFDEAD"],["Navy","#000080"],
  ["OldLace","#FDF5E6"],["Olive","#808000"],["OliveDrab","#6B8E23"],
  ["Orange","#FFA500"],["OrangeRed","#FF4500"],["Orchid","#DA70D6"],
  ["PaleGoldenrod","#EEE8AA"],["PaleGreen","#98FB98"],["PaleTurquoise","#AFEEEE"],
  ["PaleVioletRed","#DB7093"],["PapayaWhip","#FFEFD5"],["PeachPuff","#FFDAB9"],
  ["Peru","#CD853F"],["Pink","#FFC0CB"],["Plum","#DDA0DD"],
  ["PowderBlue","#B0E0E6"],["Purple","#800080"],["RebeccaPurple","#663399"],
  ["Red","#FF0000"],["RosyBrown","#BC8F8F"],["RoyalBlue","#4169E1"],
  ["SaddleBrown","#8B4513"],["Salmon","#FA8072"],["SandyBrown","#F4A460"],
  ["SeaGreen","#2E8B57"],["Seashell","#FFF5EE"],["Sienna","#A0522D"],
  ["Silver","#C0C0C0"],["SkyBlue","#87CEEB"],["SlateBlue","#6A5ACD"],
  ["SlateGray","#708090"],["Snow","#FFFAFA"],["SpringGreen","#00FF7F"],
  ["SteelBlue","#4682B4"],["Tan","#D2B48C"],["Teal","#008080"],
  ["Thistle","#D8BFD8"],["Tomato","#FF6347"],["Turquoise","#40E0D0"],
  ["Violet","#EE82EE"],["Wheat","#F5DEB3"],["White","#FFFFFF"],
  ["WhiteSmoke","#F5F5F5"],["Yellow","#FFFF00"],["YellowGreen","#9ACD32"],
];

export function nearestColorName(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  let minDist = Infinity;
  let nearest = "Unknown";
  for (const [name, colorHex] of CSS_NAMED_COLORS) {
    const c = hexToRgb(colorHex);
    const d = (r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2;
    if (d < minDist) { minDist = d; nearest = name; }
  }
  return nearest;
}

// ── Palette generation ────────────────────────────────────────────────────────

export type PaletteType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "monochrome"
  | "material";

export const PALETTE_LABELS: Record<PaletteType, string> = {
  complementary: "Comp",
  analogous: "Analog",
  triadic: "Triadic",
  tetradic: "Tetradic",
  monochrome: "Mono",
  material: "Material",
};

const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

export function generatePalette(baseHex: string, type: PaletteType): string[] {
  const hsl = rgbToHsl(hexToRgb(baseHex));

  switch (type) {
    case "complementary":
      return [0, 180].map((o) =>
        rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + o) % 360 }))
      );

    case "analogous":
      return [-30, -15, 0, 15, 30].map((o) =>
        rgbToHex(hslToRgb({ ...hsl, h: ((hsl.h + o) + 360) % 360 }))
      );

    case "triadic":
      return [0, 120, 240].map((o) =>
        rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + o) % 360 }))
      );

    case "tetradic":
      return [0, 90, 180, 270].map((o) =>
        rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + o) % 360 }))
      );

    case "monochrome":
      return [15, 30, 45, 60, 75].map((l) =>
        rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l }))
      );

    case "material": {
      const steps = [95, 88, 77, 66, 55, hsl.l, clamp(hsl.l - 10, 5), clamp(hsl.l - 20, 5), clamp(hsl.l - 30, 5), clamp(hsl.l - 42, 5)];
      return steps.map((l) =>
        rgbToHex(hslToRgb({ h: hsl.h, s: Math.min(hsl.s, 80), l }))
      );
    }

    default:
      return [baseHex];
  }
}

export const MATERIAL_STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

// ── Variants ──────────────────────────────────────────────────────────────────

export type VariantType = "darker" | "lighter" | "muted" | "vibrant" | "random";

export const VARIANT_LABELS: Record<VariantType, string> = {
  darker: "Darker",
  lighter: "Lighter",
  muted: "Muted",
  vibrant: "Vibrant",
  random: "Random",
};

export function applyVariant(baseHex: string, variant: VariantType): string[] {
  const hsl = rgbToHsl(hexToRgb(baseHex));

  switch (variant) {
    case "darker":
      return [5, 4, 3, 2, 1].map((n) =>
        rgbToHex(hslToRgb({ ...hsl, l: clamp(hsl.l - n * 8) }))
      );

    case "lighter":
      return [1, 2, 3, 4, 5].map((n) =>
        rgbToHex(hslToRgb({ ...hsl, l: clamp(hsl.l + n * 8) }))
      );

    case "muted":
      return [80, 60, 40, 20, 10].map((pct) =>
        rgbToHex(hslToRgb({ ...hsl, s: clamp(Math.round(hsl.s * pct / 100)) }))
      );

    case "vibrant":
      return [1, 2, 3, 4, 5].map((n) =>
        rgbToHex(hslToRgb({ ...hsl, s: clamp(hsl.s + n * 12) }))
      );

    case "random":
      return Array.from({ length: 5 }, () =>
        rgbToHex(hslToRgb({
          h: Math.floor(Math.random() * 360),
          s: 55 + Math.floor(Math.random() * 35),
          l: 38 + Math.floor(Math.random() * 30),
        }))
      );

    default:
      return [baseHex];
  }
}
