import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  categories,
} from "../../../shared/data/index";
import { RestaurantCard } from "../components/RestaurantCard";
import { Bell, Search, X } from "lucide-react";
import clsx from "clsx";
import * as Ionicons from "react-icons/io5";
import { useRestaurantContext } from "../contexts/RestaurantContext";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { restaurants, setRestaurants } = useRestaurantContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

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

  useEffect(() => {
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
        const newRestaurant = {
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
          isHighlighted: false,
        };
        setRestaurants((prev) => [newRestaurant, ...prev]);
      }
    }
  }, [searchParams, restaurants, setRestaurants]);

  const handleRestaurantClick = (restaurant: any) => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
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

      <div className="relative mb-4">
        <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
        <input
          className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm"
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex overflow-x-auto gap-2 mb-6 pb-1">
        {categories.map((cat) => {
          const iconName = cat.icon
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("");
          const Icon = Ionicons[`Io${iconName}` as keyof typeof Ionicons];
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedTab(cat.id)}
              className={clsx(
                "flex flex-col items-center px-3 py-2 rounded-lg whitespace-nowrap text-sm",
                selectedTab === cat.id
                  ? "bg-blue-100 text-blue-500"
                  : "text-gray-500"
              )}
            >
              <div key={cat.id} className="flex flex-col items-center p-2">
                {Icon ? (
                  <Icon className="w-5 h-5 mb-1 text-gray-600" />
                ) : (
                  <span className="text-sm text-gray-400">?</span>
                )}
                <span className="text-sm">{cat.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-3">
        {searchQuery ? "Search Results" : "Popular Restaurants"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRestaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
            onPress={() => handleRestaurantClick(r)}
            onPhotoPress={() => {
              setPreviewImage(r.image[0]);
              setShowPreview(true);
            }}
            onHighlight={() => {
              setHighlighted((prev) => {
                const next = new Set(prev);
                next.has(r.id) ? next.delete(r.id) : next.add(r.id);
                return next;
              });
            }}
            isHighlighted={highlighted.has(r.id)}
          />
        ))}
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex flex-col justify-center items-center z-50">
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[70vh] rounded-lg"
          />
          <button
            onClick={() => setShowPreview(false)}
            className="mt-4 bg-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <X className="w-4 h-4" /> <span>Close</span>
          </button>
        </div>
      )}
    </div>
  );
}
