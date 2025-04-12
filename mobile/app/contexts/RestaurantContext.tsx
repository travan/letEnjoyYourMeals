import React, { createContext, useContext, useState } from "react";
import { Restaurant, Comment } from "@shared/data/index";

type RestaurantContextType = {
  restaurants: Restaurant[];
  setRestaurants: React.Dispatch<React.SetStateAction<Restaurant[]>>;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider = ({ children }: { children: React.ReactNode }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  return (
    <RestaurantContext.Provider value={{ restaurants, setRestaurants, comments, setComments  }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurantContext = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error("useRestaurantContext must be used within a RestaurantProvider");
  return context;
};
