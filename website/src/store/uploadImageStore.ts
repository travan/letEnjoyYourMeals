import { create } from "zustand";
import { useRestaurantStore } from "./restaurantStore";

const API_URL = import.meta.env.VITE_API_URL;

interface UploadedImage {
  url: string;
  deleteUrl?: string;
}

interface UploadImageState {
  uploadedImages: UploadedImage[];
  uploading: boolean;
  addUploadedImage: (url: string, deleteUrl?: string) => void;
  setUploading: (value: boolean) => void;
  uploadImage: (file: File, restaurantId: string) => Promise<void>;
}

export const useUploadImageStore = create<UploadImageState>((set, get) => ({
  uploadedImages: [],
  uploading: false,

  addUploadedImage: (url, deleteUrl) =>
    set((state) => ({
      uploadedImages: [...state.uploadedImages, { url, deleteUrl }],
    })),

  setUploading: (value) => set({ uploading: value }),

  uploadImage: async (file: File, restaurantId: string) => {
    get().setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

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

      const { restaurants, updateRestaurant } = useRestaurantStore.getState();
      const currentRestaurant = restaurants[restaurantId];

      if (currentRestaurant) {
        const currentPhotoUrls = currentRestaurant.image ?? [];

        const newPhotoUrls = [...currentPhotoUrls, resData.url];

        updateRestaurant(restaurantId, { image: newPhotoUrls });
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
    } finally {
      get().setUploading(false);
    }
  },
}));
