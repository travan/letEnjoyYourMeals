import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Linking,
  Modal,
  Share,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";

import { photoDetails } from "../styles/photoDetails";
import CameraComponent from "../components/CameraComponent";
import { CommentModal } from "../components/CommentModal";

//store
import {
  useRestaurantsList,
  useRestaurantStore,
} from "../store/restaurantStore";
import { useCommentsList, useCommentStore } from "../store/commentStore";
import { useCategoryStore } from "../store/categoryStore";
import { Comment, Restaurant } from "@shared/data";

export default function PhotoDetails() {
  const params = useLocalSearchParams();
  const [showMap, setShowMap] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [showComments, setShowComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);

  //store
  const restaurants = useRestaurantsList();
  const updateRestaurant = useRestaurantStore(
    (state) => state.updateRestaurant
  );

  const fetchComments = useCommentStore((state) => state.fetchComments);
  const postComment = useCommentStore((state) => state.postComment);
  const { categories } = useCategoryStore();

  const restaurant = restaurants.filter(
    (restaurant) => restaurant.id === params.id
  )[0];

  useEffect(() => {
    if (restaurant.id) {
      fetchComments(restaurant.id);
    }
  }, [fetchComments, restaurant.id]);

  const commentsByRestaurant = useCommentsList(restaurant.id);

  // Parse image data
  const imageArray = restaurant.image || [];

  const getCategoryIcon = (categoryId: string) => {
    const categoryData = categories.find((cat) => cat.id === categoryId);
    return (
      (categoryData?.icon as keyof typeof Ionicons.glyphMap) ||
      "restaurant-outline"
    );
  };

  const getCategoryName = (categoryId: string) => {
    const categoryData = categories.find((cat) => cat.id === categoryId);
    return categoryData?.name || "Restaurant";
  };

  const getLocationCoordinates = async () => {
    try {
      if (restaurant.coordinates) {
        setCoordinates({
          latitude: restaurant.coordinates.latitude,
          longitude: restaurant.coordinates.longitude,
        });
        setShowMap(true);
      } else {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: parseFloat(restaurant.coordinates?.latitude as string),
          longitude: parseFloat(restaurant.coordinates?.longitude as string),
        });

        if (address) {
          setCoordinates({
            latitude: parseFloat(restaurant.coordinates?.latitude as string),
            longitude: parseFloat(restaurant.coordinates?.longitude as string),
          });
          setShowMap(true);
        }
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const openLocationInMaps = async () => {
    try {
      if (restaurant.coordinates) {
        const query = encodeURIComponent(restaurant.location as string);
        const url = Platform.select({
          ios: `maps://${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}?q=${query}`,
          android: `geo:${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}?q=${query}`,
        });

        if (url) {
          await Linking.openURL(url);
        }
      } else {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: parseFloat(restaurant.coordinates?.latitude as string),
          longitude: parseFloat(restaurant.coordinates?.longitude as string),
        });

        if (address) {
          const query = encodeURIComponent(
            `${address.street || ""} ${address.city || ""} ${
              address.region || ""
            } ${address.country || ""}`
          );
          const url = Platform.select({
            ios: `maps://0,0?q=${query}`,
            android: `geo:0,0?q=${query}`,
          });

          if (url) {
            await Linking.openURL(url);
          }
        }
      }
    } catch (error) {
      console.error("Error opening location:", error);
    }
  };

  const getRating = () => {
    const totalRating = commentsByRestaurant.reduce(
      (sum, comment) => sum + comment.rating,
      0
    );
    const averageRating = totalRating / commentsByRestaurant.length;
    return averageRating.toFixed(1);
  };

  const handleShare = async () => {
    try {
      const locationText = params.location as string;
      const coordinates = `${params.latitude},${params.longitude}`;
      const shareMessage = `Check out this place: ${locationText}\nLocation: ${coordinates}`;

      await Share.share({
        message: shareMessage,
        title: locationText,
        url: Platform.select({
          ios: `maps://${params.latitude},${
            params.longitude
          }?q=${encodeURIComponent(locationText)}`,
          android: `geo:${params.latitude},${
            params.longitude
          }?q=${encodeURIComponent(locationText)}`,
        }),
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share location.");
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const pageNum = Math.floor(contentOffset / viewSize);
    setCurrentImageIndex(pageNum);
  };

  const handleModalScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const pageNum = Math.floor(contentOffset / viewSize);
    setModalImageIndex(pageNum);
  };

  const handleImagePress = () => {
    setModalImageIndex(currentImageIndex);
    setShowFullImage(true);
  };

  const handlePhotoTaken = (photoUri: string) => {
    const newImageArray = [...imageArray, photoUri];

    restaurant.image = newImageArray;

    updateRestaurant(restaurant.id, restaurant);

    setShowCamera(false);
  };

  const commentSetter = useCallback(
    (value: React.SetStateAction<Comment[]>) => {
      const newComments =
        typeof value === "function" ? value(commentsByRestaurant) : value;
      postComment(newComments[0]);
    },
    [commentsByRestaurant, postComment]
  );

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className={photoDetails.container}>
      <View className={photoDetails.header}>
        <TouchableOpacity
          onPress={handleBack}
          className={photoDetails.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className={photoDetails.headerTitle}>Restaurant</Text>
      </View>

      <View className={photoDetails.mainContent}>
        <ScrollView
          className={photoDetails.content}
          showsVerticalScrollIndicator={false}
        >
          <View className="h-72 relative">
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              className="h-full"
              contentContainerStyle={{ width: `${100 * imageArray.length}%` }}
              decelerationRate="fast"
              snapToInterval={Dimensions.get("window").width}
              snapToAlignment="center"
            >
              {imageArray.map((img: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  className="w-full h-full"
                  style={{
                    width: Dimensions.get("window").width,
                    height: "100%",
                  }}
                  onPress={handleImagePress}
                >
                  <Image
                    source={{ uri: img }}
                    className={photoDetails.photo}
                    resizeMode="cover"
                    style={{
                      width: "100%",
                      height: "100%",
                      flex: 1,
                    }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View className="absolute bottom-4 right-4 bg-black/50 px-2 py-1 rounded-full">
              <Text className="text-white text-sm">
                {currentImageIndex + 1} / {imageArray.length}
              </Text>
            </View>
          </View>

          <View className={photoDetails.detailsContainer}>
            <Text className={photoDetails.title}>{restaurant.name}</Text>

            <View className={photoDetails.infoRow}>
              <View className={photoDetails.infoItem}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className={photoDetails.infoText}>{restaurant.time}</Text>
              </View>
              <View className={photoDetails.infoItem}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text className={photoDetails.infoText}>{getRating()}</Text>
              </View>
              <View className={photoDetails.infoItem}>
                <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                <Text className={photoDetails.infoText}>
                  {restaurant.price}
                </Text>
              </View>
            </View>

            <View className={photoDetails.infoRow}>
              <View className={photoDetails.infoItem}>
                <Ionicons
                  name={getCategoryIcon(restaurant.category as string)}
                  size={16}
                  color="#6B7280"
                />
                <Text className={photoDetails.infoText}>
                  {getCategoryName(restaurant.category as string)}
                </Text>
              </View>
            </View>

            {restaurant.description && (
              <View className={photoDetails.categoryDescriptionContainer}>
                <Text className={photoDetails.categoryDescriptionText}>
                  {restaurant.description}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className={photoDetails.locationContainer}
              onPress={getLocationCoordinates}
            >
              <Ionicons name="location" size={20} color="#6B7280" />
              <Text className={photoDetails.locationText}>
                {restaurant.location || "Location not specified"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#6B7280"
                className={photoDetails.locationArrow}
              />
            </TouchableOpacity>

            {restaurant.contact?.phone && (
              <View className={photoDetails.infoSection}>
                <Text className={photoDetails.sectionTitle}>Phone</Text>
                <Text className={photoDetails.sectionText}>
                  {restaurant.contact.phone}
                </Text>
              </View>
            )}

            {restaurant.contact?.website && (
              <View className={photoDetails.infoSection}>
                <Text className={photoDetails.sectionTitle}>Website</Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(restaurant.contact?.website as string)
                  }
                >
                  <Text
                    className={`${photoDetails.sectionText} ${photoDetails.linkText}`}
                  >
                    {restaurant.contact?.website}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {restaurant.operatingHours && (
              <View className={photoDetails.infoSection}>
                <Text className={photoDetails.sectionTitle}>Opening Hours</Text>
                {Object.entries(restaurant.operatingHours).map(
                  ([day, hours]) => (
                    <View key={day} className="flex-row justify-between py-0.5">
                      <Text className="w-1/2 text-gray-700 capitalize">
                        {day}
                      </Text>
                      <Text className="w-1/2 text-right text-gray-800">{`${hours.open} - ${hours.close}`}</Text>
                    </View>
                  )
                )}
              </View>
            )}

            {restaurant.features && (
              <View className={photoDetails.infoSection}>
                <Text className={photoDetails.sectionTitle}>Features</Text>
                <View className={photoDetails.featuresContainer}>
                  {restaurant.features.map((feature: string, index: number) => (
                    <View key={index} className={photoDetails.featureItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#10B981"
                      />
                      <Text className={photoDetails.featureText}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View className={photoDetails.actionsContainer}>
          <TouchableOpacity
            className={photoDetails.actionButton}
            onPress={() => setShowComments(true)}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#6B7280" />
            <Text className={photoDetails.actionText}>
              {commentsByRestaurant.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className={photoDetails.actionButton}>
            <Ionicons name="heart-outline" size={24} color="#6B7280" />
            <Text className={photoDetails.actionText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={photoDetails.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="#6B7280" />
            <Text className={photoDetails.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={photoDetails.actionButton}
            onPress={() => setShowCamera(true)}
          >
            <Ionicons name="camera-outline" size={24} color="#6B7280" />
            <Text className={photoDetails.actionText}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showMap}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMap(false)}
      >
        <View className={photoDetails.modalOverlay}>
          <View className={photoDetails.modalContent}>
            <View className={photoDetails.modalHeader}>
              <Text className={photoDetails.modalTitle}>
                {restaurant.location || "Location"}
              </Text>
              <TouchableOpacity
                className={photoDetails.closeButton}
                onPress={() => setShowMap(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {coordinates && (
              <View className={photoDetails.mapContainer}>
                <MapView
                  className={photoDetails.map}
                  initialRegion={{
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  style={{ flex: 1 }}
                >
                  <Marker
                    coordinate={{
                      latitude: coordinates.latitude,
                      longitude: coordinates.longitude,
                    }}
                    title={restaurant.location as string}
                  />
                </MapView>
                <TouchableOpacity
                  className={photoDetails.openMapsButton}
                  onPress={openLocationInMaps}
                >
                  <Ionicons name="navigate" size={20} color="#ffffff" />
                  <Text className={photoDetails.openMapsText}>
                    Open in Maps
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <CommentModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        listComments={commentsByRestaurant}
        restaurantId={params.id as string}
        setComments={commentSetter}
      />

      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <SafeAreaView className="flex-1 bg-black">
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity
              className="p-2"
              onPress={() => setShowFullImage(false)}
            >
              <Ionicons name="close" size={30} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold">
              {modalImageIndex + 1} / {imageArray.length}
            </Text>
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleModalScroll}
            scrollEventThrottle={16}
            className="flex-1"
            contentContainerStyle={{ width: `${100 * imageArray.length}%` }}
            decelerationRate="fast"
            snapToInterval={Dimensions.get("window").width}
            snapToAlignment="center"
          >
            {imageArray.map((img: string, index: number) => (
              <View
                key={index}
                className="w-full h-full"
                style={{
                  width: Dimensions.get("window").width,
                  height: "100%",
                }}
              >
                <Image
                  source={{ uri: img }}
                  className={photoDetails.fullImage}
                  resizeMode="contain"
                  style={{
                    width: "100%",
                    height: "100%",
                    flex: 1,
                  }}
                />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showCamera}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
      >
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            <View className="flex-1">
              <CameraComponent
                onPhotoTaken={handlePhotoTaken}
                showPreview={false}
                onClose={() => setShowCamera(false)}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
