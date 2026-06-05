import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import PixelText from "../PixelText";

interface Props {
  onClose: () => void;
}

export default function AboutModal({ onClose }: Props) {
  const [version, setVersion] = useState("0.1.0");

  useEffect(() => {
    getVersion().then(setVersion).catch(() => {});
  }, []);

  // Close on Escape or backdrop click
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const openWebsite = () => invoke("open_url", { url: "https://latticeworks.studio" });

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
      onMouseDown={onClose}
    >
      {/* Card — stop propagation so clicking inside doesn't close */}
      <div
        className="relative flex flex-col items-center gap-5 rounded border border-vscode-border shadow-2xl px-8 py-7"
        style={{ background: "#1e1e1e", minWidth: 260 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-vscode-muted hover:text-vscode-red transition-colors"
          aria-label="Close"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>

        {/* Pixel title */}
        <PixelText text="LATTICECOLOR" pixelSize={2} color="#C4897E" />

        {/* Divider */}
        <div className="w-full h-px bg-vscode-border" />

        {/* Info */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-vscode-muted text-[10px] tracking-widest uppercase">Version</span>
          <span className="text-vscode-text text-sm font-mono">{version}</span>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-vscode-muted text-[10px] tracking-widest uppercase">Made by</span>
          <span className="text-vscode-text text-xs">LatticeWorks Studio</span>
        </div>

        {/* Website link */}
        <button
          onClick={openWebsite}
          className="flex items-center gap-1.5 text-vscode-accent hover:text-vscode-accentHover transition-colors text-xs"
        >
          latticeworks.studio
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M4 2H2a1 1 0 00-1 1v5a1 1 0 001 1h5a1 1 0 001-1V6" />
            <path d="M6 1h3v3M9 1L5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
