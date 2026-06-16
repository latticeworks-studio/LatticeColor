# Eyedropper

## Activating

Trigger the eyedropper in any of three ways:

- **`Ctrl + Shift + C`** — global hotkey, works from any app even when the panel is hidden
- Click the **eyedropper icon** in the panel title bar
- The hotkey emits an event to the panel even while it is hidden — no need to show the window first

Once activated, LatticeColor hides itself, captures a screenshot, then expands to fullscreen to display the overlay.

## The Overlay

| Element | What it does |
|---|---|
| **Frozen screenshot** | The full screen at the moment of capture, rendered underneath the cursor |
| **Magnifier** | A circular loupe showing a 16×16 pixel area zoomed 10×, with a pixel grid and a highlighted center cell |
| **Colour label** | Below the magnifier — shows the hex value and RGB components of the pixel under the cursor |
| **Crosshair cursor** | A custom `+` cursor in the LatticeColor accent colour, replacing the system cursor |
| **Hint bar** | Bottom-centre — reminds you of the two actions available |

## Picking a Colour

Click anywhere on the overlay. The pixel under the cursor at the moment of click is sampled and set as the active colour. The overlay closes and the panel returns to its normal size.

## Cancelling

Press **`Escape`** at any time to cancel without picking. The panel returns to its previous state with no change to the active colour.

## Multi-Monitor

LatticeColor captures the monitor your cursor is on at the moment you trigger the eyedropper — not necessarily the monitor the panel is sitting on. Move your cursor to a second display before pressing `Ctrl + Shift + C` and that screen will be captured.

> The fullscreen overlay appears on whichever display the panel is currently on. The captured image is shown there regardless of its origin, so you can always click to pick the right colour.
