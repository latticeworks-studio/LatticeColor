/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./overlay.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
      },
      colors: {
        vscode: {
          bg: "#1e1e1e",
          sidebar: "#252526",
          panel: "#2d2d30",
          border: "#3e3e42",
          text: "#cccccc",
          muted: "#6a6a6a",
          accent: "#52D7C6",
          accentHover: "#6ee7d9",
          blue: "#4fc1ff",
          green: "#4ec9b0",
          yellow: "#dcdcaa",
          red: "#f44747",
          orange: "#ce9178",
        },
      },
    },
  },
  plugins: [],
};
