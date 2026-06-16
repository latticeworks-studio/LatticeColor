# Palette Tools

## Overview

The palette section sits below the colour readout. It generates a set of harmonious colours derived from the active colour in real time. Switch between palette types using the tab row; apply variants using the buttons below the swatches.

Click any palette swatch to set it as the active colour.
Right-click any swatch to copy its hex value.

---

## Palette Types

### Comp
**Complementary.** The colour directly opposite on the hue wheel (+180°). Two swatches: the base and its complement. Maximum contrast — great for bold, high-impact pairings.

### Analog
**Analogous.** Five colours spread across a 60° arc around the base hue (±15°, ±30°). Natural and harmonious — like the colours in a sunset or forest.

### Triadic
**Triadic.** Three colours evenly spaced at 120° intervals. Vibrant yet balanced — use one as dominant and the other two as accents.

### Tetradic
**Tetradic.** Four colours at 90° intervals forming a rectangle on the wheel. Rich and complex — works best with one hue leading.

### Mono
**Monochromatic.** Five lightness steps of the same hue and saturation (15% → 75% L). Refined and cohesive — easy to layer without ever clashing.

### Material
**Material Tonal.** Ten steps following Material Design's 50–900 tonal scale. Step labels (50, 100, 200, … 900) are shown below each swatch. Use this for building complete, accessible UI colour systems.

---

## Variants

The row of buttons below the swatches applies a transformation to the active colour and shows five tonal steps of that transformation.

| Variant | What it does |
|---|---|
| **Darker** | Five progressively darker shades (lightness −8% per step) |
| **Lighter** | Five progressively lighter tints (+8% per step) |
| **Muted** | Five saturation reductions (80% → 10% of original saturation) |
| **Vibrant** | Five saturation increases (+12% per step) |
| **Random** | Five random colours — consistent saturation and lightness range for coherent results |

Click the active variant button again to collapse the variant row.

---

## Exporting as CSS

The **CSS** button at the right end of the variant row copies the current palette as CSS custom properties, ready to paste into a stylesheet.

For most palette types the output looks like:

```css
--color-1: #C4897E;
--color-2: #C4A77E;
--color-3: #C4BC7E;
--color-4: #B5C47E;
--color-5: #97C47E;
```

For the **Material** palette, step names match the tonal scale:

```css
--color-50: #F9EDEC;
--color-100: #F2DAD7;
--color-200: #E5B4AE;
--color-300: #D88E86;
--color-400: #CC695D;
--color-500: #C4897E;
--color-600: #A06961;
--color-700: #7D5049;
--color-800: #593832;
--color-900: #2E1C19;
```
