# Color Readout

## Main Swatch

The large square swatch at the top of the panel shows the active colour. Below it, the nearest CSS named colour is displayed (e.g. `DarkSalmon`, `SlateBlue`). This is computed from the full list of 148 CSS named colours using the closest Euclidean RGB distance.

**Click** the swatch to open the custom colour picker.
**Right-click** the swatch to copy its hex value via the context menu.

## Custom Colour Picker

Clicking the main swatch opens an HSV colour picker anchored below it.

| Control | What it does |
|---|---|
| **Gradient canvas** | The large square — horizontal axis is saturation, vertical axis is value. Click or drag to set both at once. |
| **Hue slider** | The rainbow strip below the canvas — drag left/right to change hue. |
| **Hex input** | Type a hex value directly and press Enter to jump to that colour. |
| **Preview swatch** | Shows the currently selected colour in real time before you close. |

Click outside the picker or press `Escape` to close it. Any colour you dial in is applied immediately to the panel.

## Readout Rows

Four rows display the active colour in different formats. Each row has a **copy** button on the right.

| Label | Display | What the copy button produces |
|---|---|---|
| **Hex** | `#C4897E` | `#C4897E` |
| **RGB** | `196, 137, 126` | `rgb(196, 137, 126)` |
| **HSL** | `8°, 40%, 63%` | `hsl(8, 40%, 63%)` |
| **OKLCH** | `oklch(0.644 0.067 22.5)` | `oklch(0.644 0.067 22.5)` |

The RGB and HSL copy values are CSS-ready — paste them directly into a stylesheet.

## Context Menu

Right-click any colour swatch anywhere in the app — the main swatch, palette swatches, or history swatches — to get a **Copy [HEX]** context menu. The hex is copied to the clipboard and the menu closes automatically.

## Colour History

The history bar at the bottom of the panel shows your last 10 picked colours as small swatches.

- **Click** a history swatch to restore that colour as the active colour.
- **Right-click** a history swatch to copy its hex value.

History persists across restarts. Each new pick pushes the previous colour into history. Duplicates are deduplicated automatically.
