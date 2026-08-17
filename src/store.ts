import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";

let _store: Store | null = null;
async function getDiskStore(): Promise<Store> {
  if (!_store) _store = await Store.load("latticecolor.json");
  return _store;
}

async function persist(pickedColor: string, history: string[]) {
  const s = await getDiskStore();
  await s.set("pickedColor", pickedColor);
  await s.set("history", history);
  await s.save();
}

interface ColorState {
  pickedColor: string;
  history: string[];
  /** The last color actually committed to history (ignores in-progress drag previews). */
  lastCommitted: string;
  setPickedColor: (hex: string) => void;
  /** Live-updates the displayed color without touching history — for in-progress drags. */
  previewColor: (hex: string) => void;
  setFromHistory: (hex: string) => void;
  hydrate: () => Promise<void>;
}

export const useColorStore = create<ColorState>((set, get) => ({
  pickedColor: "#C4897E",
  history: [],
  lastCommitted: "#C4897E",

  hydrate: async () => {
    const s = await getDiskStore();
    const history = (await s.get<string[]>("history")) ?? [];
    const pickedColor = (await s.get<string>("pickedColor")) ?? "#C4897E";
    set({ history, pickedColor, lastCommitted: pickedColor });
  },

  setPickedColor: (hex) => {
    const { history, lastCommitted } = get();
    const normalized = hex.toUpperCase();
    if (normalized === lastCommitted) {
      set({ pickedColor: normalized });
      return;
    }
    const newHistory = [lastCommitted, ...history.filter((h) => h !== lastCommitted)].slice(0, 10);
    set({ pickedColor: normalized, history: newHistory, lastCommitted: normalized });
    void persist(normalized, newHistory);
  },

  previewColor: (hex) => {
    set({ pickedColor: hex.toUpperCase() });
  },

  setFromHistory: (hex) => {
    const { history, lastCommitted } = get();
    const newHistory = [lastCommitted, ...history.filter((h) => h !== hex)].slice(0, 10);
    set({ pickedColor: hex, history: newHistory, lastCommitted: hex });
    void persist(hex, newHistory);
  },
}));

export { getDiskStore };
