import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import { Restaurant } from "@shared/data/index";
import { updateQueue } from "../services/queueService";
const API_URL = import.meta.env.VITE_API_URL;

interface RestaurantState {
  restaurants: Record<string, Restaurant>;
  ids: string[];
  isLoading: boolean;
  error: string | null;
  fetched: boolean;
  pendingChanges: number;
}

interface RestaurantActions {
  setRestaurants: (restaurants: Restaurant[]) => void;
  addRestaurantLocal: (restaurant: Restaurant) => void;
  updateRestaurantLocal: (id: string, data: Partial<Restaurant>) => void;
  deleteRestaurantLocal: (id: string) => void;

  addRestaurant: (restaurant: Restaurant) => void;
  updateRestaurant: (id: string, data: Partial<Restaurant>) => void;
  deleteRestaurant: (id: string) => void;

  fetchRestaurants: () => Promise<void>;
  forceSyncChanges: () => Promise<void>;

  incrementPendingChanges: () => void;
  decrementPendingChanges: () => void;

  reset: () => void;
}

type RestaurantStore = RestaurantState & RestaurantActions;

const normalizeRestaurants = (
  restaurants: Restaurant[]
): { byId: Record<string, Restaurant>; ids: string[] } => {
  const byId: Record<string, Restaurant> = {};
  const ids: string[] = [];

  restaurants.forEach((restaurant) => {
    byId[restaurant.id] = restaurant;
    ids.push(restaurant.id);
  });

  return { byId, ids };
};

export const useRestaurantStore = create<RestaurantStore>()(
  devtools(
    immer((set, get) => ({
      restaurants: {},
      ids: [],
      isLoading: false,
      error: null,
      fetched: false,
      pendingChanges: 0,

      // STATE MODIFIERS
      setRestaurants: (restaurants) => {
        const { byId, ids } = normalizeRestaurants(restaurants);
        set((state) => {
          state.restaurants = byId;
          state.ids = ids;
          state.fetched = true;
        });
      },

      addRestaurantLocal: (restaurant) => {
        set((state) => {
          state.restaurants[restaurant.id] = restaurant;
          state.ids.unshift(restaurant.id);
        });
      },

      updateRestaurantLocal: (id, data) => {
        set((state) => {
          if (state.restaurants[id]) {
            state.restaurants[id] = { ...state.restaurants[id], ...data };
          }
        });
      },

      deleteRestaurantLocal: (id) => {
        set((state) => {
          delete state.restaurants[id];
          state.ids = state.ids.filter((itemId) => itemId !== id);
        });
      },

      addRestaurant: (restaurant) => {
        get().addRestaurantLocal(restaurant);

        updateQueue.enqueue({
          type: "restaurant",
          action: "add",
          data: restaurant,
        });

        get().incrementPendingChanges();
      },

      updateRestaurant: (id, data) => {
        get().updateRestaurantLocal(id, data);

        updateQueue.enqueue({
          type: "restaurant",
          action: "update",
          id,
          data,
        });

        get().incrementPendingChanges();
      },

      deleteRestaurant: (id) => {
        get().deleteRestaurantLocal(id);

        updateQueue.enqueue({
          type: "restaurant",
          action: "delete",
          id,
        });

        get().incrementPendingChanges();
      },

      fetchRestaurants: async () => {
        if (get().fetched) return;

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const res = await fetch(`${API_URL}/api/restaurants`, {
            method: "GET",
            credentials: "include",
          });
          if (!res.ok)
            throw new Error(`Error ${res.status}: ${res.statusText}`);

          const data = await res.json();
          get().setRestaurants(data);
        } catch (err) {
          console.error("Failed to fetch restaurants", err);
          set((state) => {
            state.error = err instanceof Error ? err.message : "Unknown error";
          });
        } finally {
          set((state) => {
            state.isLoading = false;
          });
        }
      },

      forceSyncChanges: async () => {
        await updateQueue.forceFlush();
        set((state) => {
          state.pendingChanges = 0;
        });
      },

      incrementPendingChanges: () => {
        set((state) => {
          state.pendingChanges += 1;
        });
      },

      decrementPendingChanges: () => {
        set((state) => {
          state.pendingChanges = Math.max(0, state.pendingChanges - 1);
        });
      },

      reset: () =>
        set((state) => {
          state.restaurants = {};
          state.ids = [];
          state.isLoading = false;
          state.error = null;
          state.fetched = false;
          state.pendingChanges = 0;
        }),
    })),
    { name: "restaurant-store" }
  )
);

export const useRestaurantsList = () => {
  const store = useRestaurantStore();
  return store.ids.map((id) => store.restaurants[id]);
};
