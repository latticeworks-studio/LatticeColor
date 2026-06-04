import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { useColorStore } from "./store";
import { rgbToHex } from "./colorEngine";
import PixelText from "./PixelText";
import ColorReadout from "./components/ColorReadout";
import PaletteSection from "./components/PaletteSection";
import HistoryBar from "./components/HistoryBar";
import EyedropperOverlay from "./Overlay";

const PANEL_W = 380;
const PANEL_H = 580;

function EyedropperIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 1.5l3 3-7 7-3 .5.5-3z" />
      <path d="M7.5 3.5l3 3" />
      <circle cx="2.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function App() {
  const { pickedColor, setPickedColor } = useColorStore();
  const [screenData, setScreenData] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  // Listen for global shortcut trigger from Rust
  useEffect(() => {
    const promise = listen("activate-eyedropper", () => { void startEyedropper(); });
    return () => { promise.then((fn) => fn()); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startEyedropper = async () => {
    if (screenData || capturing) return;
    setCapturing(true);
    try {
      // Rust hides the window, waits, captures, then re-shows
      const base64 = await invoke<string>("capture_screen");

      // Go fullscreen BEFORE mounting the overlay so the canvas is drawn
      // at screen dimensions, not panel dimensions.
      const win = getCurrentWebviewWindow();
      await win.setFullscreen(true);
      await win.setFocus();

      // Give the OS one frame to actually resize the window before React renders
      await new Promise<void>((r) => setTimeout(r, 80));

      setScreenData(base64);
    } catch (err) {
      console.error("Capture failed:", err);
      setCapturing(false);
    }
  };

  const handlePick = async (r: number, g: number, b: number) => {
    setPickedColor(rgbToHex({ r, g, b }));
    await exitEyedropper();
  };

  const exitEyedropper = async () => {
    const win = getCurrentWebviewWindow();
    await win.setFullscreen(false);
    // Explicitly restore panel size in case setFullscreen(false) doesn't snap back
    await win.setSize(new LogicalSize(PANEL_W, PANEL_H));
    setScreenData(null);
    setCapturing(false);
  };

  // Render fullscreen overlay while eyedropper is active
  if (screenData) {
    return (
      <EyedropperOverlay
        screenData={screenData}
        onPick={handlePick}
        onCancel={exitEyedropper}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-vscode-bg overflow-hidden">
      {/* Title bar */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-3 py-2 bg-vscode-sidebar border-b border-vscode-border select-none flex-shrink-0"
      >
        <div data-tauri-drag-region>
          <PixelText text="LATTICECOLOR" pixelSize={2} color="#52D7C6" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {["Ctrl", "Shift", "C"].map((k) => (
              <span
                key={k}
                className="text-[10px] text-vscode-muted border border-vscode-border rounded px-1 py-px leading-none"
              >
                {k}
              </span>
            ))}
          </div>
          <button
            onClick={() => void startEyedropper()}
            disabled={capturing}
            className={`transition-colors ${
              capturing
                ? "text-vscode-accent animate-pulse"
                : "text-vscode-muted hover:text-vscode-accent"
            }`}
            title="Pick color from screen (Ctrl+Shift+C)"
          >
            <EyedropperIcon />
          </button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        <ColorReadout hex={pickedColor} />
        <PaletteSection baseHex={pickedColor} />
        <HistoryBar />
      </div>
    </div>
  );
}
