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
  setPickedColor: (hex: string) => void;
  setFromHistory: (hex: string) => void;
  hydrate: () => Promise<void>;
}

export const useColorStore = create<ColorState>((set, get) => ({
  pickedColor: "#C4897E",
  history: [],

  hydrate: async () => {
    const s = await getDiskStore();
    const history = (await s.get<string[]>("history")) ?? [];
    const pickedColor = (await s.get<string>("pickedColor")) ?? "#C4897E";
    set({ history, pickedColor });
  },

  setPickedColor: (hex) => {
    const { pickedColor, history } = get();
    const normalized = hex.toUpperCase();
    if (normalized === pickedColor) return;
    const newHistory = [pickedColor, ...history.filter((h) => h !== pickedColor)].slice(0, 10);
    set({ pickedColor: normalized, history: newHistory });
    void persist(normalized, newHistory);
  },

  setFromHistory: (hex) => {
    const { history, pickedColor } = get();
    const newHistory = [pickedColor, ...history.filter((h) => h !== hex)].slice(0, 10);
    set({ pickedColor: hex, history: newHistory });
    void persist(hex, newHistory);
  },
}));

export { getDiskStore };
