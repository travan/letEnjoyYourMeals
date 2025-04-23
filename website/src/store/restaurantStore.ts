import { create } from "zustand";
import { Restaurant } from "../../../shared/data/index";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";

interface RestaurantState {
  restaurants: Record<string, Restaurant>;
  ids: string[];
  isLoading: boolean;
  error: string | null;
  fetched: boolean;
}

interface RestaurantActions {
  // State modifiers
  setRestaurants: (restaurants: Restaurant[]) => void;
  addRestaurantLocal: (restaurant: Restaurant) => void;
  updateRestaurantLocal: (id: string, data: Partial<Restaurant>) => void;
  deleteRestaurantLocal: (id: string) => void;

  // API actions
  fetchRestaurants: () => Promise<void>;
  addRestaurant: (restaurant: Restaurant) => Promise<void>;
  updateRestaurant: (id: string, data: Partial<Restaurant>) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;

  // Reset
  reset: () => void;
}

type RestaurantStore = RestaurantState & RestaurantActions;

const restaurantService = {
  fetch: async () => {
    const res = await fetch("/api/restaurants");
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
  },
  
  add: async (restaurant: Restaurant) => {
    const res = await fetch("/api/restaurants", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restaurant),
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
  },
  
  update: async (id: string, data: Partial<Restaurant>) => {
    const res = await fetch(`/api/restaurants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
  },
  
  delete: async (id: string) => {
    const res = await fetch(`/api/restaurants/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
  }
};

const normalizeRestaurants = (restaurants: Restaurant[]): { byId: Record<string, Restaurant>, ids: string[] } => {
  const byId: Record<string, Restaurant> = {};
  const ids: string[] = [];
  
  restaurants.forEach(restaurant => {
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
          state.ids.unshift(restaurant.id); // Thêm vào đầu danh sách
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
          state.ids = state.ids.filter((itemId: string) => itemId !== id);
        });
      },

      // API HANDLERS
      fetchRestaurants: async () => {
        if (get().fetched) return;
        
        set((state) => { state.isLoading = true; state.error = null; });
        
        try {
          const data = await restaurantService.fetch();
          get().setRestaurants(data);
        } catch (err) {
          console.error("Failed to fetch restaurants", err);
          set((state) => { 
            state.error = err instanceof Error ? err.message : "Unknown error";
          });
        } finally {
          set((state) => { state.isLoading = false; });
        }
      },

      addRestaurant: async (restaurant) => {
        set((state) => { state.isLoading = true; state.error = null; });
        
        try {
          await restaurantService.add(restaurant);
          get().addRestaurantLocal(restaurant);
        } catch (err) {
          console.error("Failed to add restaurant", err);
          set((state) => { 
            state.error = err instanceof Error ? err.message : "Unknown error";
          });
        } finally {
          set((state) => { state.isLoading = false; });
        }
      },

      updateRestaurant: async (id, data) => {
        set((state) => { state.isLoading = true; state.error = null; });
        
        try {
          await restaurantService.update(id, data);
          get().updateRestaurantLocal(id, data);
        } catch (err) {
          console.error("Failed to update restaurant", err);
          set((state) => { 
            state.error = err instanceof Error ? err.message : "Unknown error";
          });
        } finally {
          set((state) => { state.isLoading = false; });
        }
      },

      deleteRestaurant: async (id) => {
        set((state) => { state.isLoading = true; state.error = null; });
        
        try {
          await restaurantService.delete(id);
          get().deleteRestaurantLocal(id);
        } catch (err) {
          console.error("Failed to delete restaurant", err);
          set((state) => { 
            state.error = err instanceof Error ? err.message : "Unknown error";
          });
        } finally {
          set((state) => { state.isLoading = false; });
        }
      },

      reset: () => set((state) => {
        state.restaurants = {};
        state.ids = [];
        state.isLoading = false;
        state.error = null;
        state.fetched = false;
      }),
    })), 
    { name: 'restaurant-store' }
  )
);

export const useRestaurantsList = () => {
  const store = useRestaurantStore();
  return store.ids.map(id => store.restaurants[id]);
};

export const useRestaurantById = (id: string) => {
  return useRestaurantStore(state => state.restaurants[id]);
};

export const useRestaurantLoading = () => {
  return useRestaurantStore(state => state.isLoading);
};

export const useRestaurantError = () => {
  return useRestaurantStore(state => state.error);
};