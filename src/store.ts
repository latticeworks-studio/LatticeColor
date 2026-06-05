import { create } from "zustand";

interface ColorState {
  pickedColor: string;
  history: string[];
  setPickedColor: (hex: string) => void;
  setFromHistory: (hex: string) => void;
}

export const useColorStore = create<ColorState>((set, get) => ({
  pickedColor: "#C4897E",
  history: [],

  setPickedColor: (hex) => {
    const { pickedColor, history } = get();
    const normalized = hex.toUpperCase();
    if (normalized === pickedColor) return;
    const newHistory = [pickedColor, ...history.filter((h) => h !== pickedColor)].slice(0, 5);
    set({ pickedColor: normalized, history: newHistory });
  },

  setFromHistory: (hex) => {
    const { history, pickedColor } = get();
    const newHistory = [pickedColor, ...history.filter((h) => h !== hex)].slice(0, 5);
    set({ pickedColor: hex, history: newHistory });
  },
}));
