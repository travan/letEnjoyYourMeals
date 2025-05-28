import { create } from "zustand";
import { useRestaurantStore } from "./restaurantStore";
import { API_URL } from "@/apiConfig";
import { Restaurant } from "@shared/data";

interface UploadedImage {
  url: string;
  deleteUrl?: string;
}

interface UploadImageState {
  uploadedImages: UploadedImage[];
  uploading: boolean;
  addUploadedImage: (url: string, deleteUrl?: string) => void;
  setUploading: (value: boolean) => void;
  uploadImage: (
    file: { uri: string; type: string; name: string },
    restaurantId: string | null,
    restaurant: Restaurant | null
  ) => Promise<void>;
}

export const useUploadImageStore = create<UploadImageState>((set, get) => ({
  uploadedImages: [],
  uploading: false,

  addUploadedImage: (url, deleteUrl) =>
    set((state) => ({
      uploadedImages: [...state.uploadedImages, { url, deleteUrl }],
    })),

  setUploading: (value) => set({ uploading: value }),

  uploadImage: async (
    file: { uri: string; type: string; name: string },
    restaurantId: string | null,
    restaurant: Restaurant | null
  ) => {
    get().setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const resData = await res.json();

      if (!res.ok || !resData.url) {
        throw new Error(resData.error || "Image upload failed");
      }

      get().addUploadedImage(resData.url, resData.deleteUrl);

      const { restaurants, updateRestaurant, addRestaurant } =
        useRestaurantStore.getState();

      // --- Case: update image for existing restaurant ---
      if (restaurantId && restaurants[restaurantId]) {
        const currentRestaurant = restaurants[restaurantId];
        const currentPhotos = currentRestaurant.image ?? [];
        const updatedPhotos = [...currentPhotos, resData.url];

        updateRestaurant(restaurantId, { image: updatedPhotos });
        return;
      }

      // --- Case: add image for a new restaurant ---
      if (restaurant) {
        const restaurantWithImage = {
          ...restaurant,
          image: [resData.url],
        };
        addRestaurant(restaurantWithImage);
        return;
      }

      console.warn(
        "Missing restaurantId or restaurant object while uploading image."
      );
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      get().setUploading(false);
    }
  },
}));
