import { createContext, useContext, useState, ReactNode } from "react";
import { Restaurant, featuredRestaurants as initialData, SampleComments as initialComments, Comment } from "@shared/data/index";

type RestaurantContextType = {
  restaurants: Restaurant[];
  setRestaurants: React.Dispatch<React.SetStateAction<Restaurant[]>>;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(
  undefined
);

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialData);
  const [comments, setComments] = useState<Comment[]>(initialComments);

  return (
    <RestaurantContext.Provider value={{ restaurants, setRestaurants, comments, setComments }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurantContext = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error("useRestaurantContext must be used within provider");
  return context;
};
