import { useCallback, useEffect, useRef, useState } from "react";
import { quantizeColors } from "./colorEngine";
import type { PaletteSize } from "./colorEngine";

const SIZES: PaletteSize[] = [16, 32, 64, 128, 256, 512];

interface Rect { x1: number; y1: number; x2: number; y2: number }

interface Props {
  screenData: string;
  paletteSize: PaletteSize;
  onPick: (colors: string[], size: PaletteSize) => void;
  onCancel: () => void;
}

export default function AreaOverlay({ screenData, paletteSize, onPick, onCancel }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState<PaletteSize>(paletteSize);
  const [rect, setRect] = useState<Rect | null>(null);
  const dragging = useRef(false);

  useEffect(() => { rootRef.current?.focus(); }, [ready]);

  // Draw the screenshot onto the background canvas
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      setReady(true);
    };
    img.src = `data:image/jpeg;base64,${screenData}`;
  }, [screenData]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragging.current = true;
    setRect({ x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY });
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setRect((r) => r ? { ...r, x2: e.clientX, y2: e.clientY } : r);
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent, currentSize: PaletteSize) => {
    if (!dragging.current) return;
    dragging.current = false;

    const x = Math.min(rect?.x1 ?? e.clientX, e.clientX);
    const y = Math.min(rect?.y1 ?? e.clientY, e.clientY);
    const w = Math.abs(e.clientX - (rect?.x1 ?? e.clientX));
    const h = Math.abs(e.clientY - (rect?.y1 ?? e.clientY));

    setRect(null);

    if (w < 4 || h < 4) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(x, y, w, h);
    const colors = quantizeColors(imageData, currentSize);
    onPick(colors, currentSize);
  }, [rect, onPick]);

  // Computed display rect (normalized so x/y is always top-left)
  const display = rect ? {
    x: Math.min(rect.x1, rect.x2),
    y: Math.min(rect.y1, rect.y2),
    w: Math.abs(rect.x2 - rect.x1),
    h: Math.abs(rect.y2 - rect.y1),
  } : null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 overflow-hidden outline-none select-none"
      style={{ cursor: "crosshair", background: "#000" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={(e) => onMouseUp(e, size)}
      onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
      tabIndex={0}
    >
      {/* Frozen screenshot */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {ready && (
        <>
          {/* Dim + selection rectangle */}
          {display && display.w > 0 && display.h > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width="100%"
              height="100%"
            >
              <defs>
                <mask id="area-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect x={display.x} y={display.y} width={display.w} height={display.h} fill="black" />
                </mask>
              </defs>
              {/* dim everything outside */}
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#area-mask)" />
              {/* selection border */}
              <rect
                x={display.x} y={display.y}
                width={display.w} height={display.h}
                fill="none"
                stroke="#C4897E"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              {/* corner handles */}
              {([[0,0],[1,0],[0,1],[1,1]] as [number,number][]).map(([cx, cy]) => (
                <rect
                  key={`${cx}${cy}`}
                  x={display.x + cx * display.w - 3}
                  y={display.y + cy * display.h - 3}
                  width={6} height={6}
                  fill="#C4897E"
                />
              ))}
            </svg>
          )}

          {/* Size selector bar — pointer events allowed so the user can tap it */}
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-vscode-sidebar border border-vscode-border rounded px-3 py-1.5 shadow-lg"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] text-vscode-muted mr-1.5 tracking-wide">COLORS</span>
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                  size === s
                    ? "border-vscode-accent text-vscode-accent"
                    : "border-vscode-border text-vscode-muted hover:border-vscode-muted hover:text-vscode-text"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Hint */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] text-vscode-muted bg-vscode-sidebar border border-vscode-border rounded px-3 py-1.5">
            Drag to sample an area · <span className="text-vscode-text">Esc</span> to cancel
          </div>
        </>
      )}
    </div>
  );
}
