import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { LogicalSize, PhysicalPosition } from "@tauri-apps/api/dpi";
import { useColorStore, getDiskStore } from "./store";
import { rgbToHex } from "./colorEngine";
import PixelText from "./PixelText";
import ColorReadout from "./components/ColorReadout";
import PaletteSection from "./components/PaletteSection";
import HistoryBar from "./components/HistoryBar";
import EyedropperOverlay from "./Overlay";
import { ContextMenuProvider } from "./ContextMenuProvider";
import AboutModal from "./components/AboutModal";
import Tooltip from "./components/Tooltip";

const PANEL_W = 380;
const PANEL_H = 380;

function EyedropperIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      {/* Color sample target — round head distinguishes it from a pencil */}
      <circle cx="11" cy="3" r="1.8" />
      {/* Thick tube body */}
      <path d="M9.8 4.2 L5 9" strokeWidth="2.4" />
      {/* Collar then narrow nozzle */}
      <path d="M5 9 L3.5 10.5" />
      <path d="M3.5 10.5 L2 12.5" strokeWidth="0.9" />
      {/* Drop at tip */}
      <circle cx="1.6" cy="12.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function App() {
  const { pickedColor, setPickedColor, hydrate } = useColorStore();
  const [screenData, setScreenData] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Hydrate persisted color store and restore window position on first load
  useEffect(() => {
    void (async () => {
      await hydrate();
      const s = await getDiskStore();
      const x = await s.get<number>("winX");
      const y = await s.get<number>("winY");
      if (x != null && y != null) {
        await getCurrentWebviewWindow().setPosition(new PhysicalPosition(x, y));
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist window position whenever the window is moved
  useEffect(() => {
    const win = getCurrentWebviewWindow();
    const promise = win.onMoved(async ({ payload }) => {
      const s = await getDiskStore();
      await s.set("winX", payload.x);
      await s.set("winY", payload.y);
      await s.save();
    });
    return () => { promise.then((fn) => fn()); };
  }, []);

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
    <ContextMenuProvider>
    <div
      className="flex flex-col h-full bg-vscode-bg overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Title bar */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-3 py-2 bg-vscode-sidebar border-b border-vscode-border select-none flex-shrink-0"
      >
        {/* pointer-events-none so clicks fall through to the drag region */}
        <div className="pointer-events-none">
          <PixelText text="LATTICECOLOR" pixelSize={2} color="#C4897E" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 pointer-events-none">
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
          <Tooltip title="About LatticeColor" body="Version info, credits and links.">
            <button
              onClick={() => setAboutOpen(true)}
              className="text-vscode-muted hover:text-vscode-text transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                <circle cx="6.5" cy="6.5" r="5.5" />
                <path d="M6.5 5.5v4" />
                <circle cx="6.5" cy="3.5" r="0.6" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </Tooltip>
          <button
            onClick={() => getCurrentWebviewWindow().hide()}
            className="text-vscode-muted hover:text-vscode-red transition-colors ml-2"
            title="Hide"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        <ColorReadout hex={pickedColor} />
        <PaletteSection baseHex={pickedColor} />
        <HistoryBar />
      </div>

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </div>
    </ContextMenuProvider>
  );
}
