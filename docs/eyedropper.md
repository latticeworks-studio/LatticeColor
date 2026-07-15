# Eyedropper

## Activating

Trigger the eyedropper in any of three ways:

- **`Ctrl + Shift + C`** — global hotkey, works from any app even when the panel is hidden
- **Click** the eyedropper icon in the panel title bar — picks a single colour
- **Hold** the eyedropper icon for half a second — opens the **Area Palette** dropdown

The small **▾ chevron** below the eyedropper icon indicates that a long-press action is available.

Once activated, LatticeColor hides itself, captures a screenshot, then expands to fullscreen to display the overlay.

---

## The Overlay

| Element | What it does |
|---|---|
| **Frozen screenshot** | The full screen at the moment of capture, rendered underneath the cursor |
| **Magnifier** | A circular loupe showing a 16×16 pixel area zoomed 10×, with a pixel grid and a highlighted center cell |
| **Colour label** | Below the magnifier — shows the hex value and RGB components of the pixel under the cursor |
| **Crosshair cursor** | A custom `+` cursor in the LatticeColor accent colour, replacing the system cursor |
| **Hint bar** | Bottom-centre — reminds you of the two actions available |

---

## Picking a Colour

Click anywhere on the overlay. The pixel under the cursor at the moment of click is sampled and set as the active colour. The overlay closes and the panel returns to its normal size.

---

## Area Palette Mode

Hold the eyedropper icon until the dropdown appears, then choose a palette size (16 – 512 colours). The eyedropper activates in **Area** mode:

1. The overlay opens with a crosshair cursor and a **COLORS** size selector bar at the top (you can change your mind about size here too).
2. **Click and drag** to draw a rectangle over any part of the screen — exactly like the Windows Snipping Tool.
3. As soon as you release the mouse button, LatticeColor samples every pixel in the selection and extracts the most representative colours using a median-cut algorithm.
4. The Palette Creator opens immediately with the sampled palette loaded.

> **Tip:** Sample a reference image, a mood board, or a screenshot of an existing scene to extract a harmonious palette from real-world colours.

The size buttons and ↺ Regen in the Palette Creator are locked until you save, so you can't accidentally overwrite the sampled colours. See [Palette Creator](palette-creator.md) for details.

Press **`Escape`** at any time to cancel without sampling.

---

## Cancelling

Press **`Escape`** at any time during any eyedropper mode to cancel. The panel returns to its previous state with no changes.

---

## Multi-Monitor

LatticeColor captures the monitor your cursor is on at the moment you trigger the eyedropper — not necessarily the monitor the panel is sitting on. Move your cursor to a second display before pressing `Ctrl + Shift + C` and that screen will be captured.

> The fullscreen overlay appears on whichever display the panel is currently on. The captured image is shown there regardless of its origin, so you can always click to pick the right colour.
