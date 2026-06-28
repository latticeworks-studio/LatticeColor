# Palette Creator

## Overview

The Palette Creator is a full-panel mode for generating, editing, and exporting fixed-size colour palettes. It is designed for voxel art tools, pixel art engines, and any application that uses an indexed palette — including Magica Voxel.

Open it by clicking the **grid icon (⊞)** in the main title bar. A **Back** arrow returns you to the main panel.

---

## Palette Sizes

Choose how many colours the palette contains using the size buttons in the toolbar:

| Size | Grid |
|---|---|
| **16** | 4 × 4 |
| **32** | 8 × 4 |
| **64** | 8 × 8 |
| **128** | 16 × 8 |
| **256** | 16 × 16 |

Switching size regenerates the palette from the current root colour.

---

## Colour Generation

Clicking **↺ Regen** (or switching size) generates a new palette from the active colour in the main panel.

Generation sweeps the full 360° hue wheel at the root colour's saturation and lightness. This means:

- The palette covers every colour family — red, orange, yellow, green, cyan, blue, violet.
- The overall character of the root is preserved across all slots: a muted olive root gives a muted rainbow; a vivid red gives a vivid rainbow; a dark, desaturated slate gives a dark, desaturated rainbow.
- The sweep starts at the root's own hue, so the first swatch always matches what you picked.

To change the character of the palette, pick a different colour with the eyedropper or colour picker, then hit Regen.

---

## Editing Swatches

**Click** any swatch to open the HSV colour picker and edit that slot individually.  
Click the same swatch again, or press `Escape`, to close the picker.  
**Right-click** any swatch to copy its hex value.

---

## Naming

Click the palette name at the top of the panel to rename it. Press `Enter` or click away to confirm. Names can be up to 32 characters.

---

## Saving & Loading

- **Save** — saves (or updates) the current palette in `latticecolor.json`. The label changes from *unsaved* to *saved*.
- **New** — starts a fresh auto-generated 16-colour palette.
- **Delete** — removes the currently active saved palette and starts fresh.

The **grid icon** in the title bar shows a count badge when you have saved palettes. Click it to open the saved palettes list and load one.

Palettes persist across restarts.

---

## Exporting as PNG

Click **Export PNG** to write a `256×1` pixel PNG to your **Downloads** folder.

- Slots are filled left-to-right with the palette colours.
- Any unused slots (e.g. a 64-colour palette leaves 192 empty slots) are filled with `#C3C3C3`.
- The filename is derived from the palette name (spaces and special characters replaced with underscores).

This format is directly compatible with **Magica Voxel** and other tools that use a 256-entry indexed colour palette.
