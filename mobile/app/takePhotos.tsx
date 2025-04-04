import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import CameraComponent from "./components/CameraComponent";
import { takePhotosStyles } from "./styles/takePhotos";
import { categories } from "@shared/data/constants/categories";

export default function TakePhotos() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [rating, setRating] = useState("4.5");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("$$");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFormModal, setShowFormModal] = useState(false);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const locationString = `${address.city || ""}${
          address.city && address.region ? ", " : ""
        }${address.region || ""}`;
        setLocation(locationString);
        setCoordinates({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setLocation(null);
      setCoordinates(null);
    }
  };

  const handlePhotoTaken = (uri: string) => {
    setPhotoUri(uri);
    getLocation();
  };

  const handleShare = () => {
    if (photoUri) {
      setShowFormModal(true);
    }
  };

  const handleFormSubmit = () => {
    if (photoUri) {
      // Create a new photo object with all the form data
      const photoData = {
        photoUri: photoUri.toString(),
        location: location || "",
        latitude: coordinates?.latitude?.toString() || "",
        longitude: coordinates?.longitude?.toString() || "",
        timestamp: new Date().getTime().toString(),
        action: "addPhoto",
        name: restaurantName,
        rating: rating,
        description: description,
        price: price,
        category: selectedCategory,
      };
      // Navigate to the main screen with the photo data
      router.replace({
        pathname: "/",
        params: photoData,
      });
    }
  };

  const renderFormModal = () => (
    <Modal
      visible={showFormModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFormModal(false)}
    >
      <View className="flex-1 bg-black bg-opacity-50">
        <View className="flex-1 bg-white rounded-t-3xl mt-10">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">
              Restaurant Details
            </Text>
            <TouchableOpacity onPress={() => setShowFormModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView className="p-4">
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Restaurant Name
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                value={restaurantName}
                onChangeText={setRestaurantName}
                placeholder="Enter restaurant name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Rating</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                value={rating}
                onChangeText={setRating}
                placeholder="Enter rating (1-5)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Price</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                value={price}
                onChangeText={setPrice}
                placeholder="Enter price (e.g., $$)"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-2"
              >
                <View className="flex-row">
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      className={[
                        "mr-3 p-3 rounded-lg border",
                        selectedCategory === category.id
                          ? "bg-blue-100 border-blue-500"
                          : "bg-gray-100 border-gray-300",
                      ].join(" ")}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <View className="items-center">
                        <Ionicons
                          name={category.icon as keyof typeof Ionicons.glyphMap}
                          size={24}
                          color={
                            selectedCategory === category.id
                              ? "#3B82F6"
                              : "#6B7280"
                          }
                        />
                        <Text
                          className={[
                            "mt-1 text-xs",
                            selectedCategory === category.id
                              ? "text-blue-500 font-medium"
                              : "text-gray-600",
                          ].join(" ")}
                        >
                          {category.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Description
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800 h-32"
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
          <View className="flex-row justify-end p-4 border-t border-gray-200">
            <TouchableOpacity
              className={[
                "flex-row items-center justify-center bg-blue-500 px-6 py-3 rounded-lg",
                (!restaurantName || !rating || !price || !selectedCategory) &&
                  "opacity-50",
              ]
                .filter(Boolean)
                .join(" ")}
              onPress={handleFormSubmit}
              disabled={
                !restaurantName || !rating || !price || !selectedCategory
              }
            >
              <Ionicons name="checkmark" size={24} color="#fff" />
              <Text className="text-white font-medium ml-2">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className={takePhotosStyles.container}>
      {!photoUri ? (
        <CameraComponent onPhotoTaken={handlePhotoTaken} onClose={() => router.back()} />
      ) : (
        <View className={takePhotosStyles.previewContainer}>
          <View className="flex-1 bg-black">
            <Image
              source={{ uri: photoUri }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <View className={takePhotosStyles.previewActions}>
            <TouchableOpacity
              className={takePhotosStyles.previewButton}
              onPress={() => setPhotoUri(null)}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text className={takePhotosStyles.previewButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={takePhotosStyles.previewButton}
              onPress={handleShare}
            >
              <Ionicons name="share" size={24} color="#fff" />
              <Text className={takePhotosStyles.previewButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {renderFormModal()}
    </SafeAreaView>
  );
}
