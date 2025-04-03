import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Restaurant,
  featuredRestaurants as initialRestaurants,
  categories,
} from "./data/index";
import { styles } from "./styles/index";
import { RestaurantCard } from "./components/RestaurantCard";

type SearchParams = {
  action?: string;
  photoUri?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  timestamp?: string;
};

export default function HomeScreen() {
  const searchParams = useLocalSearchParams<SearchParams>();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [featuredRestaurants, setFeaturedRestaurants] =
    useState<Restaurant[]>(initialRestaurants);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Filter restaurants based on search query and selected category
  const filteredRestaurants = useMemo(() => {
    return featuredRestaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (restaurant.location?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (restaurant.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesCategory = selectedTab === "all" || restaurant.category === selectedTab;
      return matchesSearch && matchesCategory;
    });
  }, [featuredRestaurants, searchQuery, selectedTab]);

  useEffect(() => {
    if (
      searchParams.action === "addPhoto" &&
      searchParams.photoUri &&
      !featuredRestaurants.some(
        (restaurant) => restaurant.image === searchParams.photoUri
      )
    ) {
      try {
        const newRestaurant: Restaurant = {
          id: Date.now().toString(),
          name: "New Restaurant",
          image: searchParams.photoUri,
          time: "Just now",
          rating: "4.5",
          location: searchParams.location || "Location not available",
          latitude: searchParams.latitude || "",
          longitude: searchParams.longitude || "",
          category: "Restaurant",
          description: "A new restaurant added by you",
          price: "$$",
        };
        setFeaturedRestaurants((prev) => [newRestaurant, ...prev]);
      } catch (error) {
        console.error("Error adding new restaurant:", error);
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

  const handleRestaurantPress = (restaurant: Restaurant) => {
    router.push({
      pathname: "/photos/[id]",
      params: {
        id: restaurant.id,
        image: restaurant.image,
        name: restaurant.name,
        time: restaurant.time,
        location: restaurant.location,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Let's Enjoin Your Food</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/takePhotos")}
            >
              <Ionicons name="camera-outline" size={24} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#111827"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={24}
            color="#6B7280"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            enablesReturnKeyAutomatically={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={24} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => setSelectedTab(category.id)}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    selectedTab === category.id && {
                      backgroundColor: "#DBEAFE",
                    },
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={selectedTab === category.id ? "#3B82F6" : "#6B7280"}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryText,
                    selectedTab === category.id && { color: "#3B82F6" },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? "Search Results" : "Popular Restaurants"}
          </Text>
          {filteredRestaurants.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search" size={48} color="#6B7280" />
              <Text style={styles.noResultsText}>No restaurants found</Text>
            </View>
          ) : (
            <View style={styles.restaurantsGrid}>
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onPhotoPress={handlePhotoPress}
                  variant="default"
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {showPreview && (
        <View style={styles.photoPreview}>
          <Image source={{ uri: previewImage }} style={styles.previewImage} />
          <View style={styles.photoActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowPreview(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
              <Text style={styles.actionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
