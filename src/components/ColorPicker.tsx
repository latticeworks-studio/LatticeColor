import { useCallback, useEffect, useRef, useState } from "react";

// ── HSV ↔ hex helpers ─────────────────────────────────────────────────────────

function hexToHsv(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let hue = 0;
  if (d !== 0) {
    switch (max) {
      case r: hue = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: hue = ((b - r) / d + 2) / 6; break;
      case b: hue = ((r - g) / d + 4) / 6; break;
    }
  }
  return [hue * 360, max === 0 ? 0 : (d / max) * 100, max * 100];
}

function hsvToHex(h: number, s: number, v: number): string {
  s /= 100; v /= 100;
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  const map: [number, number, number][] = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]];
  const [r, g, b] = map[i];
  return "#" + [r, g, b]
    .map((x) => Math.round(x * 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────

const GW = 196, GH = 140;
const HH = 12;

interface Props {
  hex: string;
  anchorEl: HTMLElement;
  onChange: (hex: string) => void;
  onClose: () => void;
}

export default function ColorPicker({ hex, anchorEl, onChange, onClose }: Props) {
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(100);
  const [val, setVal] = useState(100);
  const [hexInput, setHexInput] = useState("");
  const lastEmitted = useRef("");
  const containerRef = useRef<HTMLDivElement>(null);
  const gradRef = useRef<HTMLCanvasElement>(null);
  const hueRef = useRef<HTMLCanvasElement>(null);

  // Sync from external hex change only (not from our own emissions)
  useEffect(() => {
    if (hex === lastEmitted.current) return;
    const [h, s, v] = hexToHsv(hex);
    setHue(h); setSat(s); setVal(v);
    setHexInput(hex.replace("#", "").toUpperCase());
  }, [hex]);

  const emit = useCallback((h: number, s: number, v: number) => {
    const out = hsvToHex(h, s, v);
    lastEmitted.current = out;
    setHexInput(out.replace("#", ""));
    onChange(out);
  }, [onChange]);

  // Draw saturation/value gradient
  useEffect(() => {
    const canvas = gradRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const hg = ctx.createLinearGradient(0, 0, GW, 0);
    hg.addColorStop(0, "#fff");
    hg.addColorStop(1, `hsl(${hue},100%,50%)`);
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, GW, GH);
    const vg = ctx.createLinearGradient(0, 0, 0, GH);
    vg.addColorStop(0, "transparent");
    vg.addColorStop(1, "#000");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, GW, GH);
  }, [hue]);

  // Draw hue rainbow bar
  useEffect(() => {
    const canvas = hueRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, GW, 0);
    [0, 60, 120, 180, 240, 300, 360].forEach((h, i) =>
      g.addColorStop(i / 6, `hsl(${h},100%,50%)`)
    );
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GW, HH);
  }, []);

  // Drag helper
  const startDrag = (
    e: React.MouseEvent,
    onMove: (x: number, y: number) => void
  ) => {
    e.preventDefault();
    const move = (ev: MouseEvent) => onMove(ev.clientX, ev.clientY);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    onMove(e.clientX, e.clientY);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onGradDown = (e: React.MouseEvent) =>
    startDrag(e, (cx, cy) => {
      const r = gradRef.current!.getBoundingClientRect();
      const newS = Math.round(Math.max(0, Math.min(1, (cx - r.left) / r.width)) * 100);
      const newV = Math.round(Math.max(0, Math.min(1, 1 - (cy - r.top) / r.height)) * 100);
      setSat(newS); setVal(newV);
      emit(hue, newS, newV);
    });

  const onHueDown = (e: React.MouseEvent) =>
    startDrag(e, (cx) => {
      const r = hueRef.current!.getBoundingClientRect();
      const newH = Math.round(Math.max(0, Math.min(1, (cx - r.left) / r.width)) * 360);
      setHue(newH);
      emit(newH, sat, val);
    });

  const commitHex = (raw: string) => {
    const clean = raw.replace(/[^0-9a-fA-F]/g, "");
    if (clean.length === 6) {
      const full = "#" + clean.toUpperCase();
      const [h, s, v] = hexToHsv(full);
      setHue(h); setSat(s); setVal(v);
      lastEmitted.current = full;
      onChange(full);
    }
  };

  // Close on outside click or Escape
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (
        containerRef.current?.contains(e.target as Node) ||
        anchorEl.contains(e.target as Node)
      ) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    // Delay so the opening click doesn't immediately close
    const id = setTimeout(() => window.addEventListener("mousedown", onDown), 0);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(id);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [anchorEl, onClose]);

  // Position below the anchor, clamped to viewport
  const aRect = anchorEl.getBoundingClientRect();
  const PW = 220;
  const left = Math.min(aRect.left, window.innerWidth - PW - 8);
  const top = aRect.bottom + 6;

  const previewHex = hsvToHex(hue, sat, val);

  return (
    <div
      ref={containerRef}
      className="fixed z-50 rounded border border-vscode-border shadow-xl select-none"
      style={{ background: "#1e1e1e", left, top, width: PW, padding: 12 }}
    >
      {/* Saturation / value gradient */}
      <div
        className="relative rounded overflow-hidden cursor-crosshair"
        style={{ width: GW, height: GH }}
        onMouseDown={onGradDown}
      >
        <canvas ref={gradRef} width={GW} height={GH} className="block" />
        {/* Picker handle */}
        <div
          className="absolute pointer-events-none rounded-full border-2 border-white"
          style={{
            width: 12, height: 12,
            left: `${sat}%`,
            top: `${100 - val}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 0 1.5px rgba(0,0,0,0.5)",
          }}
        />
      </div>

      {/* Hue bar */}
      <div
        className="relative mt-2.5 rounded overflow-hidden cursor-pointer"
        style={{ width: GW, height: HH }}
        onMouseDown={onHueDown}
      >
        <canvas ref={hueRef} width={GW} height={HH} className="block" />
        {/* Hue thumb */}
        <div
          className="absolute top-0 pointer-events-none"
          style={{
            left: `${(hue / 360) * 100}%`,
            width: 3,
            height: HH,
            transform: "translateX(-50%)",
            background: "white",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
          }}
        />
      </div>

      {/* Preview + hex input */}
      <div className="flex items-center gap-2 mt-3">
        <div
          className="w-7 h-7 rounded-sm border border-vscode-border flex-shrink-0"
          style={{ backgroundColor: previewHex }}
        />
        <div className="flex items-center gap-1 flex-1 bg-vscode-panel border border-vscode-border rounded px-2 py-1">
          <span className="text-vscode-muted text-[10px] flex-shrink-0">#</span>
          <input
            className="flex-1 min-w-0 bg-transparent text-vscode-text text-xs font-mono caret-vscode-accent focus:outline-none"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, ""))}
            onBlur={(e) => commitHex(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitHex((e.target as HTMLInputElement).value); }}
            maxLength={6}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
