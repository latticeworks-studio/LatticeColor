import { useColorStore } from "../store";

export default function HistoryBar() {
  const { history, setFromHistory } = useColorStore();

  if (history.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-vscode-border">
      <span className="text-[10px] text-vscode-muted tracking-wider uppercase flex-shrink-0">
        History
      </span>
      <div className="flex items-center gap-1.5">
        {history.map((hex, i) => (
          <button
            key={i}
            className="w-6 h-6 rounded-sm border border-vscode-border hover:scale-110 transition-transform"
            style={{ backgroundColor: hex }}
            title={hex}
            onClick={() => setFromHistory(hex)}
          />
        ))}
      </div>
    </div>
  );
}
