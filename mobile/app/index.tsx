import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Category, Restaurant } from "@shared/data/index";
import { indexStyles } from "./styles/index";
import { RestaurantCard } from "./components/RestaurantCard";
import {
  useRestaurantsList,
  useRestaurantStore,
} from "./store/restaurantStore";
import { useCategoryStore } from "./store/categoryStore";
import SyncIndicator from "./components/SyncIndicator";

type SearchParams = {
  image: string;
  action?: string;
  photoUri?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  timestamp?: string;
  name?: string;
  rating?: string;
  description?: string;
  price?: string;
  category?: string;
  id?: string;
};

export default function HomeScreen() {
  const searchParams = useLocalSearchParams<SearchParams>();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const restaurants = useRestaurantsList();
  const fetchRestaurants = useRestaurantStore(
    (state: { fetchRestaurants: any }) => state.fetchRestaurants
  );
  const setRestaurants = useRestaurantStore(
    (state: { setRestaurants: any }) => state.setRestaurants
  );
  const addRestaurant = useRestaurantStore(
    (state: { addRestaurant: any }) => state.addRestaurant
  );
  const { categories, fetchCategories } = useCategoryStore();
  const [highlightedRestaurants, setHighlightedRestaurants] = useState<
    Set<string>
  >(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant: Restaurant) => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (restaurant.location?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (restaurant.description?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        );
      const matchesCategory =
        selectedTab === "all" || restaurant.category === selectedTab;
      return matchesSearch && matchesCategory;
    });
  }, [restaurants, searchQuery, selectedTab]);

  useEffect(() => {
    if (searchParams.action === "addPhoto") {
      if (
        searchParams.photoUri &&
        !restaurants.some(
          (restaurant: Restaurant) =>
            restaurant.name === searchParams.name &&
            restaurant.location === searchParams.location &&
            restaurant.coordinates?.latitude ===
              parseFloat(searchParams.latitude || "0") &&
            restaurant.coordinates?.longitude ===
              parseFloat(searchParams.longitude || "0")
        )
      ) {
        try {
          const newRestaurant: Restaurant = {
            id: Date.now().toString(),
            name: searchParams.name || "New Restaurant",
            image: [searchParams.photoUri],
            time: "Just now",
            rating: parseFloat(searchParams.rating || "4.5"),
            location: searchParams.location || "Location not available",
            coordinates: {
              latitude: parseFloat(searchParams.latitude || "0"),
              longitude: parseFloat(searchParams.longitude || "0"),
            },
            category: searchParams.category || "Restaurant",
            description:
              searchParams.description || "A new restaurant added by you",
            price: searchParams.price || "$$",
            isHighlighted: false,
          };
          setRestaurants((prev: any) => [newRestaurant, ...prev]);
          addRestaurant(newRestaurant);
        } catch (error) {
          console.error("Error adding new restaurant:", error);
        }
      }
    }
  }, [searchParams]);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handlePhotoPress = (image: string) => {
    setPreviewImage(image);
    setShowPreview(true);
  };

  const handleHighlight = (restaurantId: string) => {
    setHighlightedRestaurants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(restaurantId)) {
        newSet.delete(restaurantId);
      } else {
        newSet.add(restaurantId);
      }
      return newSet;
    });
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    router.push({
      pathname: "/photos/[id]",
      params: {
        id: restaurant.id,
      },
    });
  };

  useEffect(() => {
    if (restaurants.length > 0) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [restaurants]);

  if (loading) {
    return (
      <SafeAreaView className={indexStyles.container}>
        <View className={indexStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={indexStyles.loadingText}>
            Loading restaurants...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className={indexStyles.container}>
        <View className={indexStyles.errorContainer}>
          <Text className={indexStyles.errorText}>{error}</Text>
          <TouchableOpacity
            className={indexStyles.errorButton}
            onPress={() => setError(null)}
          >
            <Text className={indexStyles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={indexStyles.container}>
      <View className={indexStyles.header}>
        <View className={indexStyles.headerTop}>
          <Text className={indexStyles.headerTitle}>
            Let's Enjoy Your Food
          </Text>
          <View className={indexStyles.headerButtons}>
            <TouchableOpacity
              className={indexStyles.headerButton}
              onPress={() => router.push("/takePhotos")}
            >
              <Ionicons name="camera-outline" size={24} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity className={indexStyles.headerButton}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#111827"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View className={indexStyles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#6B7280"
          className={indexStyles.searchIcon}
        />
        <TextInput
          className={indexStyles.searchInput}
          placeholder="Search restaurants..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            // handleSearch(text);
          }}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          enablesReturnKeyAutomatically={true}
        />
      </View>

      <ScrollView
        className={indexStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <View className={indexStyles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category: Category) => (
              <TouchableOpacity
                key={category.id}
                className={indexStyles.categoryItem}
                onPress={() => setSelectedTab(category.id)}
              >
                <View
                  className={[
                    indexStyles.categoryIcon,
                    selectedTab === category.id && "bg-blue-100",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={selectedTab === category.id ? "#3B82F6" : "#6B7280"}
                  />
                </View>
                <Text
                  className={[
                    indexStyles.categoryText,
                    selectedTab === category.id && "text-blue-500",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className={indexStyles.section}>
          <Text className={indexStyles.sectionTitle}>
            {searchQuery ? "Search Results" : "Popular Restaurants"}
          </Text>
          <View className={indexStyles.restaurantsGrid}>
            <SyncIndicator />
            {filteredRestaurants.map((restaurant: Restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => handleRestaurantPress(restaurant)}
                onPhotoPress={() => handlePhotoPress(restaurant.image[0])}
                onHighlight={() => handleHighlight(restaurant.id)}
                isHighlighted={highlightedRestaurants.has(restaurant.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {showPreview && (
        <View className={indexStyles.photoPreview}>
          <Image
            source={{ uri: previewImage }}
            className={indexStyles.previewImage}
          />
          <View className={indexStyles.photoActions}>
            <TouchableOpacity
              className={indexStyles.actionButton}
              onPress={() => setShowPreview(false)}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
              <Text className="text-white mt-1 text-sm">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
