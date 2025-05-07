import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Restaurant, Category } from "../../../shared/data/index";
import { RestaurantCard } from "../components/RestaurantCard";
import { Bell, Search, X } from "lucide-react";
import clsx from "clsx";
import * as Ionicons from "react-icons/io5";
import {
  useRestaurantsList,
  useRestaurantStore,
} from "../store/restaurantStore";
import { useCategoryStore } from "../store/categoryStore";
import SyncIndicator from "./SyncIndicator";

interface CategoryTabProps {
  category: Category;
  isSelected: boolean;
  onSelect: () => void;
}

// Component for displaying a category tab
const CategoryTab: React.FC<CategoryTabProps> = ({
  category,
  isSelected,
  onSelect,
}) => {
  const iconName = category.icon
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  const Icon = Ionicons[`Io${iconName}` as keyof typeof Ionicons];

  return (
    <button
      onClick={onSelect}
      className={clsx(
        "flex flex-col items-center px-3 py-2 rounded-lg whitespace-nowrap text-sm",
        isSelected ? "bg-blue-100 text-blue-500" : "text-gray-500"
      )}
    >
      <div className="flex flex-col items-center p-2">
        {Icon ? (
          <Icon className="w-5 h-5 mb-1 text-gray-600" />
        ) : (
          <span className="text-sm text-gray-400">?</span>
        )}
        <span className="text-sm">{category.name}</span>
      </div>
    </button>
  );
};

// Component for image preview modal
interface ImagePreviewProps {
  image: string;
  onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex flex-col justify-center items-center z-50">
    <img
      src={image}
      alt="Preview"
      className="max-w-full max-h-[70vh] rounded-lg"
    />
    <button
      onClick={onClose}
      className="mt-4 bg-white px-4 py-2 rounded-md flex items-center gap-2"
    >
      <X className="w-4 h-4" /> <span>Close</span>
    </button>
  </div>
);

// Component for search input
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange }) => (
  <div className="relative mb-4">
    <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
    <input
      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm"
      placeholder="Search restaurants..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

function useHandleAddPhotoFromUrl(
  restaurants: Restaurant[],
  setRestaurants: (r: Restaurant[]) => void
) {
  const [searchParams] = useSearchParams();
  const hasHandledAddPhoto = useRef(false);

  useEffect(() => {
    if (hasHandledAddPhoto.current) return;

    const action = searchParams.get("action");
    if (action === "addPhoto") {
      const name = searchParams.get("name") || "New Restaurant";
      const photoUri = searchParams.get("photoUri") || "";
      const location = searchParams.get("location") || "";
      const latitude = parseFloat(searchParams.get("latitude") || "0");
      const longitude = parseFloat(searchParams.get("longitude") || "0");

      if (
        !restaurants.some((r) => r.name === name && r.location === location)
      ) {
        const newRestaurant: Restaurant = {
          id: Date.now().toString(),
          name,
          image: [photoUri],
          time: "Just now",
          rating: 4.5,
          location,
          coordinates: { latitude, longitude },
          category: searchParams.get("category") || "Restaurant",
          description: searchParams.get("description") || "Added by user",
          price: searchParams.get("price") || "$$",
        };
        setRestaurants([newRestaurant, ...restaurants]);
      }

      hasHandledAddPhoto.current = true;
    }
  }, [searchParams, restaurants, setRestaurants]);
}

// Main component
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const restaurants = useRestaurantsList();
  const fetchRestaurants = useRestaurantStore(
    (state) => state.fetchRestaurants
  );
  const setRestaurants = useRestaurantStore((state) => state.setRestaurants);
  const { categories, fetchCategories } = useCategoryStore();

  // State management
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  // Fetch data on component mount
  useEffect(() => {
    if (restaurants.length === 0) fetchRestaurants();
    if (categories.length === 0) fetchCategories();
  }, [
    fetchRestaurants,
    fetchCategories,
    restaurants.length,
    categories.length,
  ]);

  // Filter restaurants based on search and category
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        r.name.toLowerCase().includes(q) ||
        (r.location?.toLowerCase() || "").includes(q) ||
        (r.description?.toLowerCase() || "").includes(q);
      const matchesCategory =
        selectedTab === "all" || r.category === selectedTab;
      return matchesSearch && matchesCategory;
    });
  }, [restaurants, searchQuery, selectedTab]);

  // Handle new restaurant from URL params
  useHandleAddPhotoFromUrl(restaurants, setRestaurants);

  // Event handlers using useCallback
  const handleRestaurantClick = useCallback(
    (restaurant: Restaurant) => {
      if (location.pathname !== `/restaurant/${restaurant.id}`) {
        navigate(`/restaurant/${restaurant.id}`);
      }
    },
    [location.pathname, navigate]
  );

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedTab(categoryId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePhotoPress = useCallback((imageUrl: string) => {
    setPreviewImage(imageUrl);
    setShowPreview(true);
  }, []);

  const handleHighlightToggle = useCallback((restaurantId: string) => {
    setHighlighted((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(restaurantId)
        ? next.delete(restaurantId)
        : next.add(restaurantId);
      return next;
    });
  }, []);

  const closePreview = useCallback(() => {
    setShowPreview(false);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header section */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Let's Enjoin Your Meals
        </h1>
        <div className="flex gap-2">
          <button className="bg-gray-100 p-2 rounded-full">
            <Bell className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Search input */}
      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      {/* Category tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-1">
        {categories.map((cat) => (
          <CategoryTab
            key={cat.id}
            category={cat}
            isSelected={selectedTab === cat.id}
            onSelect={() => handleCategorySelect(cat.id)}
          />
        ))}
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-3">
        {searchQuery ? "Search Results" : "Popular Restaurants"}
      </h2>

      {/* Restaurant grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SyncIndicator />
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onPress={() => handleRestaurantClick(restaurant)}
            onPhotoPress={() => handlePhotoPress(restaurant.image[0])}
            onHighlight={() => handleHighlightToggle(restaurant.id)}
            isHighlighted={highlighted.has(restaurant.id)}
          />
        ))}
      </div>

      {/* Image preview modal */}
      {showPreview && (
        <ImagePreview image={previewImage} onClose={closePreview} />
      )}
    </div>
  );
};

export default HomePage;
