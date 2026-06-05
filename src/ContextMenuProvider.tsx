import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface MenuState { visible: boolean; x: number; y: number; hex: string }

const Ctx = createContext<{ open: (hex: string, x: number, y: number) => void }>({
  open: () => {},
});

export function useSwatchMenu() {
  return useContext(Ctx);
}

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuState>({ visible: false, x: 0, y: 0, hex: "" });
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => setMenu((m) => ({ ...m, visible: false })), []);

  const open = useCallback((hex: string, rawX: number, rawY: number) => {
    // Keep the menu inside the viewport
    const menuW = 160, menuH = 44;
    const x = Math.min(rawX, window.innerWidth - menuW - 8);
    const y = Math.min(rawY, window.innerHeight - menuH - 8);
    setCopied(false);
    setMenu({ visible: true, x, y, hex });
  }, []);

  // Close on any click or Escape outside the menu
  useEffect(() => {
    if (!menu.visible) return;
    const handler = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      close();
    };
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [menu.visible, close]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(menu.hex.toUpperCase());
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(close, 700);
  };

  return (
    <Ctx.Provider value={{ open }}>
      {children}

      {menu.visible && (
        <div
          className="fixed z-50 bg-vscode-sidebar border border-vscode-border rounded shadow-lg py-0.5"
          style={{ left: menu.x, top: menu.y, minWidth: 148 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-vscode-text hover:bg-vscode-panel transition-colors"
            onClick={handleCopy}
          >
            <div
              className="w-3 h-3 rounded-sm border border-vscode-border flex-shrink-0"
              style={{ backgroundColor: menu.hex }}
            />
            {copied ? "Copied!" : `Copy ${menu.hex.toUpperCase()}`}
          </button>
        </div>
      )}
    </Ctx.Provider>
  );
}
