import { useEffect, useRef, useState, useCallback } from "react";

const ZOOM = 10;
const MAG_RADIUS = 80;
const MAG_SRC_HALF = 8;

interface PixelInfo { hex: string; r: number; g: number; b: number }

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

interface Props {
  screenData: string;                                  // base64 JPEG from Rust
  onPick: (r: number, g: number, b: number) => void;
  onCancel: () => void;
}

export default function EyedropperOverlay({ screenData, onPick, onCancel }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const magCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const [pixel, setPixel] = useState<PixelInfo | null>(null);
  const [ready, setReady] = useState(false);

  // Auto-focus so Escape works immediately
  useEffect(() => { rootRef.current?.focus(); }, [ready]);

  // Draw screenshot onto background canvas once
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = bgCanvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      setReady(true);
    };
    img.src = `data:image/jpeg;base64,${screenData}`;
  }, [screenData]);

  const samplePixel = useCallback((x: number, y: number): PixelInfo | null => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const d = ctx.getImageData(x, y, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], hex: rgbToHex(d[0], d[1], d[2]) };
  }, []);

  const drawMagnifier = useCallback((x: number, y: number) => {
    const magCanvas = magCanvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    if (!magCanvas || !bgCanvas || !ready) return;
    const size = MAG_RADIUS * 2;
    magCanvas.width = size;
    magCanvas.height = size;
    const ctx = magCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(MAG_RADIUS, MAG_RADIUS, MAG_RADIUS - 1, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      bgCanvas,
      x - MAG_SRC_HALF, y - MAG_SRC_HALF,
      MAG_SRC_HALF * 2, MAG_SRC_HALF * 2,
      0, 0, size, size
    );
    ctx.restore();

    // Pixel grid lines
    const cellSize = size / (MAG_SRC_HALF * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= MAG_SRC_HALF * 2; i++) {
      ctx.beginPath(); ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cellSize); ctx.lineTo(size, i * cellSize); ctx.stroke();
    }

    // Center pixel highlight
    const cx = Math.floor(MAG_SRC_HALF) * cellSize;
    const cy = Math.floor(MAG_SRC_HALF) * cellSize;
    ctx.strokeStyle = "#C4897E";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx, cy, cellSize, cellSize);

    // Ring
    ctx.strokeStyle = "#C4897E";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(MAG_RADIUS, MAG_RADIUS, MAG_RADIUS - 1, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair arms
    const arm = Math.floor(ZOOM / 2) + 2;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MAG_RADIUS - arm, MAG_RADIUS);
    ctx.lineTo(MAG_RADIUS + arm, MAG_RADIUS);
    ctx.moveTo(MAG_RADIUS, MAG_RADIUS - arm);
    ctx.lineTo(MAG_RADIUS, MAG_RADIUS + arm);
    ctx.stroke();
  }, [ready]);

  useEffect(() => {
    drawMagnifier(pos.x, pos.y);
    setPixel(samplePixel(pos.x, pos.y));
  }, [pos, drawMagnifier, samplePixel]);

  // Keep magnifier on-screen
  const mx = pos.x + MAG_RADIUS + 16;
  const magLeft = mx + MAG_RADIUS * 2 > window.innerWidth ? pos.x - MAG_RADIUS * 2 - 16 : mx;
  const myTop = pos.y - MAG_RADIUS - 16;
  const magTop = myTop < 0 ? pos.y + 16 : myTop;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 overflow-hidden outline-none"
      style={{ cursor: "none", background: "#1e1e1e" }}
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      onClick={(e) => {
        const info = samplePixel(e.clientX, e.clientY);
        if (info) onPick(info.r, info.g, info.b);
      }}
      onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
      tabIndex={0}
    >
      {/* Frozen screenshot */}
      <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full" />

      {ready && (
        <>
          {/* Magnifier */}
          <div className="absolute pointer-events-none" style={{ left: magLeft, top: magTop }}>
            <canvas ref={magCanvasRef} />
            {pixel && (
              <div className="mt-1.5 flex items-center gap-2 bg-vscode-sidebar border border-vscode-border rounded px-2 py-1 text-xs font-mono">
                <div
                  className="w-3 h-3 rounded-sm border border-vscode-border flex-shrink-0"
                  style={{ backgroundColor: pixel.hex }}
                />
                <span className="text-vscode-text">{pixel.hex}</span>
                <span className="text-vscode-muted">{pixel.r}, {pixel.g}, {pixel.b}</span>
              </div>
            )}
          </div>

          {/* Cursor dot */}
          <div
            className="absolute pointer-events-none"
            style={{ left: pos.x - 10, top: pos.y - 10 }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <line x1="10" y1="0" x2="10" y2="7" stroke="#C4897E" strokeWidth="1.5" />
              <line x1="10" y1="13" x2="10" y2="20" stroke="#C4897E" strokeWidth="1.5" />
              <line x1="0" y1="10" x2="7" y2="10" stroke="#C4897E" strokeWidth="1.5" />
              <line x1="13" y1="10" x2="20" y2="10" stroke="#C4897E" strokeWidth="1.5" />
              <rect x="9" y="9" width="2" height="2" fill="#C4897E" />
            </svg>
          </div>

          {/* Hint */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] text-vscode-muted bg-vscode-sidebar border border-vscode-border rounded px-3 py-1.5">
            Click to pick · <span className="text-vscode-text">Esc</span> to cancel
          </div>
        </>
      )}
    </div>
  );
}
