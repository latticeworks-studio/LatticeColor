# 🎨 **ColorMatch Mini — Design Document (v0.1)**

## **1. Purpose**

ColorMatch Mini is a lightweight desktop utility that lets users pick any pixel from anywhere on screen and instantly generate color information and matching palettes. It is designed for designers, developers, artists, and anyone who frequently works with color.

The app focuses on speed, clarity, and creative exploration.

------

## **2. Core Features**

### **2.1 Global Eyedropper**

- System‑wide color picker that can be also activated via hotkey (e.g., `Ctrl+Shift+C`).
- Screen freeze + magnified preview around cursor.
- Click to capture pixel color.
- Automatically sends the captured color to the app.

### **2.2 Color Readout**

For every captured color, display:

- **Hex** (e.g., `#52D7C6`)
- **RGB** (e.g., `82, 215, 198`)
- **HSL**
- **OKLCH** (optional, modern color space)
- Copy‑to‑clipboard buttons for each format.

### **2.3 Palette Generation**

Given a base color, generate:

- **Complementary**
- **Analogous**
- **Triadic**
- **Tetradic**
- **Monochrome**
- **Material‑style tonal palette** (50 → 900)
- **Neutralized variants** (muted, desaturated)
- **Vibrant variants**

Each palette appears as a horizontal swatch row.

### **2.4 Variations**

Buttons to generate:

- **Darker palette**
- **Lighter palette**
- **Muted palette**
- **Vibrant palette**
- **Randomized matching palette**

### **2.5 Swatch Interaction**

- Clicking any swatch regenerates palettes using that color as the new base.
- Right‑click → copy hex/rgb/hsl.
- Option to “pin” a palette for comparison.

------

## **3. UI Layout**

### **3.1 Main Window**

A compact, always‑on‑top panel:

**Top Section — Picked Color**

- Large color preview square
- Hex/RGB/HSL/OKLCH readouts
- Copy buttons

**Middle Section — Palette Generator**

- Dropdown: Palette Type (Complementary, Analogous, etc.)
- Buttons: Darker / Lighter / Muted / Vibrant / Random
- Generated palette swatches (clickable)

**Bottom Section — History**

- Last 5 picked colors
- Click to restore

### **3.2 Eyedropper Overlay**

- Full‑screen transparent overlay
- Magnifier around cursor (10× zoom)
- Pixel grid + preview
- Click to confirm

------

## **4. Technical Architecture**

### **4.1 Platform**

- Desktop app (Windows/macOS/Linux)
- Likely frameworks:
  - **Tauri** (lighter, Rust backend)

### **4.2 Modules**

- **Eyedropper Module**  
   Captures pixel color from screen buffer.
- **Color Engine**  
   Handles:
  - conversions (hex ↔ rgb ↔ hsl ↔ oklch)
  - palette algorithms
  - tonal generation
- **UI Module**  
   Renders main window, swatches, history.
- **Settings Module**  
   Hotkeys, theme, export options.

------

## **5. Palette Algorithms (v0.1)**

### **5.1 Harmonies**

- Complementary: hue + 180°
- Analogous: hue ± 30°
- Triadic: hue ± 120°
- Tetradic: hue + 90°, +180°, +270°

### **5.2 Tonal Palette**

Generate 10 steps by adjusting:

- Lightness (L in HSL or OKLCH)
- Slight saturation compensation

### **5.3 Variants**

- **Darker**: reduce lightness by fixed %
- **Lighter**: increase lightness
- **Muted**: reduce saturation
- **Vibrant**: increase saturation

------

## **6. Future Enhancements**

### **6.1 Export**

- Export palette as:
  - PNG swatch strip
  - JSON
  - CSS variables
  - Tailwind config snippet

### **6.2 Brand Mode**

- Generate palettes that follow brand‑safe contrast rules.

### **6.4 Multi‑color extraction**

- Drop an image → extract dominant colors.

------

## **7. Goals for v1.0**

- Fast global eyedropper
- Accurate color readouts
- Clean palette generation
- Simple, elegant UI
- Zero friction

This is meant to be a tiny tool that feels *instant* and *delightful*.