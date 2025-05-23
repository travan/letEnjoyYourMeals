import React from "react";
import { Restaurant } from "@shared/data/index";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
  onPhotoPress?: () => void;
  onHighlight?: () => void;
  isHighlighted?: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  onHighlight,
  isHighlighted = false,
}) => {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition shadow-md hover:shadow-lg
        ${isHighlighted ? "ring-2 ring-blue-500 shadow-blue-100" : ""}`}
      onClick={onPress}
    >
      <div className="relative">
        <img
          src={restaurant.image[0]}
          alt={restaurant.name}
          className="h-48 w-full object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onHighlight?.();
          }}
          className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-md p-2 rounded-full"
        >
          {isHighlighted ? (
            <BookmarkCheck className="h-4 w-4 text-blue-500" />
          ) : (
            <Bookmark className="h-4 w-4 text-gray-800" />
          )}
        </button>
      </div>
      <div className="p-4 space-y-1">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {restaurant.name}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          {restaurant.location || "Unknown location"}
        </p>
        <div className="flex items-center text-sm text-yellow-500">
          <span>⭐ {restaurant.rating.toFixed(1)}</span>
          <span className="ml-2 text-gray-400">{restaurant.category}</span>
        </div>
      </div>
    </div>
  );
};
