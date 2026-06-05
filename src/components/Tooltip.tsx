import { useRef, useState, type ReactNode } from "react";

interface Props {
  title: string;
  body: string;
  children: ReactNode;
}

export default function Tooltip({ title, body, children }: Props) {
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const anchorRef = useRef<HTMLSpanElement>(null);

  const show = () => {
    timerRef.current = setTimeout(() => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const TW = 200;
      // Position below the anchor, clamped so it doesn't overflow right edge
      const left = Math.min(rect.left, window.innerWidth - TW - 8);
      setStyle({ left, top: rect.bottom + 6, width: TW });
      setVisible(true);
    }, 450);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <>
      <span ref={anchorRef} onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </span>

      {visible && (
        <div
          className="fixed z-50 rounded border border-vscode-border shadow-xl pointer-events-none"
          style={{ background: "#1e1e1e", padding: "8px 10px", ...style }}
        >
          <p className="text-[11px] font-medium text-vscode-accent mb-1">{title}</p>
          <p className="text-[10px] text-vscode-muted leading-relaxed">{body}</p>
        </div>
      )}
    </>
  );
}
