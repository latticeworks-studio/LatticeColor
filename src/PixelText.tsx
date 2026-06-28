import { useEffect, useRef } from "react";

type Glyph = number[][];

const FONT: Record<string, Glyph> = {
  A: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  C: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
  ],
  E: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  H: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  I: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  L: [
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  M: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  O: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  P: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  R: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ],
  T: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
};

const CHAR_W = 5;
const PIXEL_GAP = 1;

interface Props {
  text: string;
  pixelSize?: number;
  color?: string;
  animated?: boolean;
}

export default function PixelText({
  text,
  pixelSize = 3,
  color = "#C4897E",
  animated = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const chars = text.toUpperCase().split("").filter((c) => FONT[c]);
  const gap = PIXEL_GAP;
  const charGap = pixelSize + 1;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!animated) {
      container.querySelectorAll<HTMLElement>("[data-on]").forEach((el) => {
        el.style.backgroundColor = el.dataset.on === "1" ? color : "transparent";
      });
      return;
    }

    const tick = (time: number) => {
      container.querySelectorAll<HTMLElement>("[data-col]").forEach((el) => {
        if (el.dataset.on !== "1") return;
        const col = parseInt(el.dataset.col!);
        const hue = (time * 0.06 + col * 20) % 360;
        el.style.backgroundColor = `hsl(${hue}, 90%, 65%)`;
      });
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animated, color]);

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: `${gap}px` }}>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} style={{ display: "flex", gap: `${charGap}px` }}>
          {chars.map((char, ci) => (
            <div key={ci} style={{ display: "flex", gap: `${gap}px` }}>
              {FONT[char][row].map((on, colInChar) => (
                <div
                  key={colInChar}
                  data-col={ci * (CHAR_W + gap) + colInChar}
                  data-on={on ? "1" : "0"}
                  style={{
                    width: pixelSize,
                    height: pixelSize,
                    backgroundColor: on ? color : "transparent",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
