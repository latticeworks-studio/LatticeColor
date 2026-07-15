import { create } from "zustand";
import { getDiskStore } from "./store";
import type { PaletteSize } from "./colorEngine";

export type { PaletteSize };

export interface SavedPalette {
  id: string;
  name: string;
  size: PaletteSize;
  colors: string[];
}

interface PaletteState {
  colors: string[];
  size: PaletteSize;
  name: string;
  editId: string | null;
  saved: SavedPalette[];
  isSampled: boolean;
  setColors: (colors: string[]) => void;
  setColor: (index: number, hex: string) => void;
  setSize: (size: PaletteSize) => void;
  setName: (name: string) => void;
  saveCurrentPalette: () => Promise<void>;
  deleteSavedPalette: (id: string) => Promise<void>;
  loadSavedPalette: (id: string) => void;
  newPalette: (colors: string[], size: PaletteSize, sampled?: boolean) => void;
  hydratePalettes: () => Promise<void>;
}

async function persistPalettes(saved: SavedPalette[]) {
  const s = await getDiskStore();
  await s.set("palettes", saved);
  await s.save();
}

export const usePaletteStore = create<PaletteState>((set, get) => ({
  colors: [],
  size: 16,
  name: "New Palette",
  editId: null,
  saved: [],
  isSampled: false,

  hydratePalettes: async () => {
    const s = await getDiskStore();
    const saved = (await s.get<SavedPalette[]>("palettes")) ?? [];
    set({ saved });
  },

  setColors: (colors) => set({ colors }),

  setColor: (index, hex) => {
    const colors = [...get().colors];
    colors[index] = hex;
    set({ colors });
  },

  setSize: (size) => set({ size }),
  setName: (name) => set({ name }),

  newPalette: (colors, size, sampled = false) =>
    set({ colors, size, name: "New Palette", editId: null, isSampled: sampled }),

  saveCurrentPalette: async () => {
    const { colors, size, name, editId, saved } = get();
    const id = editId ?? Date.now().toString();
    const palette: SavedPalette = { id, name, size, colors };
    const updated = editId
      ? saved.map((p) => (p.id === editId ? palette : p))
      : [...saved, palette];
    set({ saved: updated, editId: id, isSampled: false });
    await persistPalettes(updated);
  },

  loadSavedPalette: (id) => {
    const found = get().saved.find((p) => p.id === id);
    if (found)
      set({ colors: found.colors, size: found.size, name: found.name, editId: found.id, isSampled: false });
  },

  deleteSavedPalette: async (id) => {
    const updated = get().saved.filter((p) => p.id !== id);
    const wasEditing = get().editId === id;
    set({ saved: updated, ...(wasEditing ? { editId: null, name: "New Palette" } : {}) });
    await persistPalettes(updated);
  },
}));
