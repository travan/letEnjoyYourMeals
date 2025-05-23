import { create } from "zustand";
import { Category } from "@shared/data/index";
import { API_URL } from "../../apiConfig";

interface CategoryState {
  categories: Category[];
  fetched: boolean;
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  fetchCategories: () => Promise<void>;
  reset: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  fetched: false,

  setCategories: (categories) => set({ categories }),

  addCategory: (category) =>
    set((state) => ({
      categories: [category, ...state.categories],
    })),

  updateCategory: (id, data) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === id ? { ...category, ...data } : category
      ),
    })),

  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== id),
    })),

  fetchCategories: async () => {
    if (get().fetched) return;
    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      set({ categories: data, fetched: true });
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  },

  reset: () => set({ categories: [], fetched: false }),
}));
