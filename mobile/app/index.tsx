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
import {
  Restaurant,
  featuredRestaurants as initialRestaurants,
  categories,
} from "@shared/data/index";
import { indexStyles } from "./styles/index";
import { RestaurantCard } from "./components/RestaurantCard";

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
  const [featuredRestaurants, setFeaturedRestaurants] =
    useState<Restaurant[]>(initialRestaurants);
  const [highlightedRestaurants, setHighlightedRestaurants] = useState<
    Set<string>
  >(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter restaurants based on search query and selected category
  const filteredRestaurants = useMemo(() => {
    return featuredRestaurants.filter((restaurant) => {
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
  }, [featuredRestaurants, searchQuery, selectedTab]);

  useEffect(() => {
    switch (searchParams.action) {
      case "addPhoto": {
        if (
          searchParams.photoUri &&
          !featuredRestaurants.some(
            (restaurant) =>
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
            setFeaturedRestaurants((prev) => [newRestaurant, ...prev]);
          } catch (error) {
            console.error("Error adding new restaurant:", error);
          }
        }
        break;
      }
      case "update": {
        if (searchParams.id) {
          const updatedRestaurant = featuredRestaurants.find(
            (restaurant) => restaurant.id === searchParams.id
          );
          
          if (updatedRestaurant) {
            updatedRestaurant.image = [...searchParams.image.split(",")];
            // for (const key in searchParams) {
            //   if (key !== "image") {
            //     updatedRestaurant[key] = searchParams[key];
            //   }
            // }
          }
        }
        break;
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

  const handleSearch = (query: string) => {
    const filtered = initialRestaurants.filter((restaurant) => {
      const searchLower = query.toLowerCase();
      return (
        restaurant.name.toLowerCase().includes(searchLower) ||
        (restaurant.location?.toLowerCase() || "").includes(searchLower) ||
        (restaurant.description?.toLowerCase() || "").includes(searchLower)
      );
    });
    setFeaturedRestaurants(filtered);
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
        image: restaurant.image,
        name: restaurant.name,
        time: new Date().toLocaleTimeString(),
        rating: restaurant.rating.toString(),
        location: restaurant.location,
        latitude: restaurant.coordinates?.latitude?.toString(),
        longitude: restaurant.coordinates?.longitude?.toString(),
        category: restaurant.category,
        price: restaurant.price,
        description: restaurant.description,
        phone: restaurant.contact?.phone,
        website: restaurant.contact?.website,
        openingHours: JSON.stringify(restaurant.operatingHours),
        features: JSON.stringify(restaurant.features),
        tags: JSON.stringify(restaurant.features),
      },
    });
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFeaturedRestaurants(initialRestaurants);
      setLoading(false);
    }, 1000);
  }, []);

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
            Let's Enjoin Your Food
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
            handleSearch(text);
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
            {categories.map((category) => (
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
            {filteredRestaurants.map((restaurant) => (
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
