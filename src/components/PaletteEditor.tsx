import { useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useColorStore } from "../store";
import { usePaletteStore } from "../paletteStore";
import type { PaletteSize } from "../paletteStore";
import { generateRestrictedPalette, hexToRgb } from "../colorEngine";
import { useSwatchMenu } from "../ContextMenuProvider";
import ColorPicker from "./ColorPicker";
import PixelText from "../PixelText";

const SIZES: PaletteSize[] = [16, 32, 64, 128, 256, 512];

function colsForSize(size: PaletteSize): number {
  return size <= 16 ? 4 : size <= 64 ? 8 : size <= 256 ? 16 : 32;
}

function swatchPxForCols(cols: number): number {
  return cols <= 4 ? 40 : cols <= 8 ? 26 : cols <= 16 ? 16 : 9;
}

interface Props {
  onClose: () => void;
}

export default function PaletteEditor({ onClose }: Props) {
  const { pickedColor } = useColorStore();
  const {
    colors, size, name, editId, saved, isSampled,
    setColors, setColor, setSize, setName,
    saveCurrentPalette, deleteSavedPalette, loadSavedPalette, newPalette,
  } = usePaletteStore();

  const { open: openContextMenu } = useSwatchMenu();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAnchorEl, setEditAnchorEl] = useState<HTMLElement | null>(null);
  const [showSavedList, setShowSavedList] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const [exportMsg, setExportMsg] = useState<{ text: string; path: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const cols = colsForSize(size);
  const swatchPx = swatchPxForCols(cols);
  const gap = 2;

  const handleRegen = () => {
    setColors(generateRestrictedPalette(pickedColor, size));
    setEditingIndex(null);
  };

  const handleSizeChange = (newSize: PaletteSize) => {
    setSize(newSize);
    setColors(generateRestrictedPalette(pickedColor, newSize));
    setEditingIndex(null);
  };

  const handleSwatchClick = (index: number, el: HTMLElement) => {
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditAnchorEl(null);
    } else {
      setEditingIndex(index);
      setEditAnchorEl(el);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await saveCurrentPalette();
    setSaving(false);
  };

  const handleNew = () => {
    const generated = generateRestrictedPalette(pickedColor, 16);
    newPalette(generated, 16);
    setNameInput("New Palette");
    setEditingIndex(null);
    setShowSavedList(false);
  };

  const handleLoad = (id: string) => {
    loadSavedPalette(id);
    const found = saved.find((p) => p.id === id);
    if (found) setNameInput(found.name);
    setShowSavedList(false);
    setEditingIndex(null);
  };

  const handleDelete = async () => {
    if (!editId) return;
    await deleteSavedPalette(editId);
    handleNew();
  };

  const handleExport = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    colors.forEach((hex, i) => {
      ctx.fillStyle = hex;
      ctx.fillRect(i, 0, 1, 1);
    });
    if (colors.length < 512) {
      ctx.fillStyle = "#C3C3C3";
      ctx.fillRect(colors.length, 0, 512 - colors.length, 1);
    }
    const base64 = canvas.toDataURL("image/png").split(",")[1];
    try {
      const path = await invoke<string>("save_palette_png", {
        base64Data: base64,
        name: name || "palette",
      });
      const filename = path.split(/[/\\]/).pop() ?? path;
      setExportMsg({ text: `Saved: ${filename}`, path });
      setTimeout(() => setExportMsg(null), 3000);
    } catch {
      setExportMsg({ text: "Export failed", path: "" });
      setTimeout(() => setExportMsg(null), 2000);
    }
  };

  const handleExportMd = async () => {
    const rows = colors.map((hex) => {
      const { r, g, b } = hexToRgb(hex);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="${hex}"/></svg>`;
      const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      return `| ![](${uri}) | \`${hex}\` | \`rgb(${r}, ${g}, ${b})\` |`;
    });
    const md = [`# ${name}`, "", "| Swatch | Hex | RGB |", "|--------|-----|-----|", ...rows].join("\n");
    try {
      const path = await invoke<string>("save_palette_md", { content: md, name: name || "palette" });
      const filename = path.split(/[/\\]/).pop() ?? path;
      setExportMsg({ text: `Saved: ${filename}`, path });
      setTimeout(() => setExportMsg(null), 3000);
    } catch {
      setExportMsg({ text: "Export failed", path: "" });
      setTimeout(() => setExportMsg(null), 2000);
    }
  };

  const commitName = () => {
    setEditingName(false);
    const trimmed = nameInput.trim();
    setName(trimmed || "Palette");
  };

  return (
    <div
      className="flex flex-col h-full bg-vscode-bg overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Title bar */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-3 py-2 bg-vscode-sidebar border-b border-vscode-border select-none flex-shrink-0"
      >
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-vscode-muted hover:text-vscode-text transition-colors"
          title="Back to main panel"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 5H1M4 2L1 5l3 3" />
          </svg>
          <span className="text-[10px] tracking-wider uppercase font-medium">Back</span>
        </button>

        <div className="pointer-events-none">
          <PixelText text="PALETTE" pixelSize={2} color="#C4897E" />
        </div>

        {/* Saved palettes dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSavedList((v) => !v)}
            className="flex items-center gap-1 text-vscode-muted hover:text-vscode-text transition-colors"
            title="Saved palettes"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
              <rect x="1" y="1" width="3.5" height="3.5" rx="0.4" />
              <rect x="6.5" y="1" width="3.5" height="3.5" rx="0.4" />
              <rect x="1" y="6.5" width="3.5" height="3.5" rx="0.4" />
              <rect x="6.5" y="6.5" width="3.5" height="3.5" rx="0.4" />
            </svg>
            {saved.length > 0 && (
              <span className="text-[10px] text-vscode-accent">{saved.length}</span>
            )}
          </button>

          {showSavedList && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSavedList(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-vscode-sidebar border border-vscode-border rounded shadow-lg z-50 min-w-[160px] max-h-48 overflow-y-auto py-1">
                {saved.length === 0 ? (
                  <div className="px-3 py-2 text-[11px] text-vscode-muted">No saved palettes</div>
                ) : (
                  saved.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleLoad(p.id)}
                      className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-vscode-panel transition-colors flex items-center justify-between gap-2 ${
                        p.id === editId ? "text-vscode-accent" : "text-vscode-text"
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="text-vscode-muted text-[10px] flex-shrink-0">{p.size}</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Palette name */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-vscode-border flex-shrink-0">
        {editingName ? (
          <input
            ref={nameRef}
            className="flex-1 bg-vscode-panel border border-vscode-accent rounded px-2 py-0.5 text-xs text-vscode-text focus:outline-none font-mono"
            value={nameInput}
            autoFocus
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") commitName();
            }}
            maxLength={32}
          />
        ) : (
          <button
            onClick={() => { setEditingName(true); setNameInput(name); }}
            className="flex-1 text-left text-vscode-text text-xs font-mono hover:text-vscode-accent transition-colors truncate"
            title="Click to rename"
          >
            {name}
          </button>
        )}
        <span className="text-[9px] text-vscode-muted tracking-wider uppercase flex-shrink-0">
          {editId ? "saved" : "unsaved"}
        </span>
      </div>

      {/* Size selector + Regen */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-vscode-border flex-shrink-0">
        {SIZES.map((s) => (
          <button
            key={s}
            onClick={() => !isSampled && handleSizeChange(s)}
            disabled={isSampled}
            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
              isSampled
                ? "border-vscode-border text-vscode-border cursor-not-allowed opacity-40"
                : size === s
                ? "border-vscode-accent text-vscode-accent"
                : "border-vscode-border text-vscode-muted hover:border-vscode-muted hover:text-vscode-text"
            }`}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => !isSampled && handleRegen()}
          disabled={isSampled}
          className={`ml-auto text-[10px] px-2 py-0.5 rounded border transition-colors ${
            isSampled
              ? "border-vscode-border text-vscode-border cursor-not-allowed opacity-40"
              : "border-vscode-border text-vscode-muted hover:border-vscode-accent hover:text-vscode-accent"
          }`}
          title={isSampled ? "Save palette first to unlock Regen" : `Regenerate from ${pickedColor}`}
        >
          ↺ Regen
        </button>
      </div>

      {/* Color grid */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${swatchPx}px)`,
            gap: `${gap}px`,
          }}
        >
          {colors.map((hex, i) => (
            <button
              key={i}
              className={`rounded-sm border transition-all ${
                editingIndex === i
                  ? "border-vscode-accent z-10 relative ring-1 ring-vscode-accent"
                  : "border-vscode-border hover:border-vscode-muted"
              }`}
              style={{ width: swatchPx, height: swatchPx, backgroundColor: hex }}
              title={hex}
              onClick={(e) => handleSwatchClick(i, e.currentTarget)}
              onContextMenu={(e) => {
                e.preventDefault();
                openContextMenu(hex, e.clientX, e.clientY);
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 border-t border-vscode-border">
        {exportMsg && (
          <button
            onClick={() => exportMsg.path && void invoke("reveal_in_explorer", { path: exportMsg.path })}
            className={`w-full text-left px-3 py-1 text-[10px] bg-vscode-panel truncate border-b border-vscode-border transition-colors ${
              exportMsg.path
                ? "text-vscode-muted hover:text-vscode-accent cursor-pointer"
                : "text-vscode-muted cursor-default"
            }`}
            title={exportMsg.path ? "Click to open in Explorer" : undefined}
          >
            {exportMsg.text}
          </button>
        )}
        <div className="flex items-center gap-1.5 px-3 py-2">
          <button
            onClick={handleNew}
            className="text-[10px] px-2 py-1 rounded border border-vscode-border text-vscode-muted hover:border-vscode-muted hover:text-vscode-text transition-colors"
          >
            New
          </button>
          {editId && (
            <button
              onClick={() => void handleDelete()}
              className="text-[10px] px-2 py-1 rounded border border-vscode-border text-vscode-muted hover:border-red-400 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => void handleSave()}
            className="text-[10px] px-3 py-1 rounded border border-vscode-accent text-vscode-accent hover:bg-vscode-accent hover:text-vscode-bg transition-colors"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => void handleExport()}
              className="text-[10px] px-2 py-1 rounded border border-vscode-border text-vscode-muted hover:border-vscode-accent hover:text-vscode-accent transition-colors"
              title="Export as 512×1 PNG to Downloads"
            >
              Export PNG
            </button>
            <button
              onClick={() => void handleExportMd()}
              className="text-[10px] px-2 py-1 rounded border border-vscode-border text-vscode-muted hover:border-vscode-accent hover:text-vscode-accent transition-colors"
              title="Export color table as Markdown"
            >
              Export MD
            </button>
          </div>
        </div>
      </div>

      {/* Color picker popover */}
      {editingIndex !== null && editAnchorEl && colors[editingIndex] && (
        <ColorPicker
          hex={colors[editingIndex]}
          anchorEl={editAnchorEl}
          onChange={(hex) => setColor(editingIndex, hex)}
          onClose={() => {
            setEditingIndex(null);
            setEditAnchorEl(null);
          }}
        />
      )}
    </div>
  );
}
