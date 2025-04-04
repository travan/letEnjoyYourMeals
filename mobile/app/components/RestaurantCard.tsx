import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Restaurant } from '@shared/data/types/restaurant';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isHighlighted?: boolean;
  onHighlight?: (id: string) => void;
  onPhotoPress?: (image: string) => void;
  showHighlightButton?: boolean;
  onPress?: (restaurant: Restaurant) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  isHighlighted = false,
  onHighlight,
  onPhotoPress,
  showHighlightButton = true,
  onPress,
  variant = 'default',
}) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localHighlighted, setLocalHighlighted] = useState(isHighlighted);

  const handleHighlightPress = () => {
    setLocalHighlighted(!localHighlighted);
    if (onHighlight) {
      onHighlight(restaurant.id);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(restaurant);
    } else {
      router.push({
        pathname: "/photos/[id]",
        params: {
          id: restaurant.id,
          image: restaurant.image,
          name: restaurant.name,
          time: restaurant.time,
          location: restaurant.location,
          latitude: restaurant.coordinates?.latitude.toString() || "0",
          longitude: restaurant.coordinates?.longitude.toString() || "0",
          rating: restaurant.rating.toString(),
          category: restaurant.category,
          price: restaurant.price,
          description: restaurant.description,
        }
      });
    }
  };

  const handleImagePress = () => {
    setShowImageModal(true);
  };

  const handleNextImage = () => {
    if (currentImageIndex < restaurant.image.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const pageNum = Math.floor(contentOffset / viewSize);
    setCurrentImageIndex(pageNum);
  };

  const renderImage = () => (
    <TouchableOpacity
      onPress={handleImagePress}
      disabled={!onPhotoPress}
      className="relative"
    >
      <Image
        source={{ uri: restaurant.image[0] }}
        className={`w-full h-48 rounded-t-xl ${variant === 'compact' ? 'w-24 h-24 rounded-lg' : ''} ${variant === 'detailed' ? 'h-60' : ''}`}
      />
      {restaurant.image.length > 1 && (
        <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-full">
          <Text className="text-white text-xs font-semibold">+{restaurant.image.length - 1}</Text>
        </View>
      )}
      {showHighlightButton && (
        <TouchableOpacity
          onPress={handleHighlightPress}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full ${
            localHighlighted ? 'bg-blue-500' : 'bg-white/80'
          }`}
        >
          <Ionicons
            name={localHighlighted ? "star" : "star-outline"}
            size={20}
            color={localHighlighted ? "#ffffff" : "#6B7280"}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderImageModal = () => (
    <Modal
      visible={showImageModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowImageModal(false)}
    >
      <View className="flex-1 bg-black/90 justify-center items-center">
        <TouchableOpacity 
          className="absolute top-16 right-5 z-10"
          onPress={() => setShowImageModal(false)}
        >
          <Ionicons name="close" size={30} color="#ffffff" />
        </TouchableOpacity>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="flex-1 w-full"
          contentContainerStyle={{ width: `${100 * restaurant.image.length}%` }}
          decelerationRate="fast"
          snapToInterval={Dimensions.get('window').width}
          snapToAlignment="center"
        >
          {restaurant.image.map((img: string, index: number) => (
            <View 
              key={index} 
              className="w-full h-full" 
              style={{ 
                width: Dimensions.get('window').width,
                height: '100%'
              }}
            >
              <Image
                source={{ uri: img }}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>
        <View className="absolute bottom-4 right-4 bg-black/50 px-2 py-1 rounded-full">
          <Text className="text-white text-sm">
            {currentImageIndex + 1} / {restaurant.image.length}
          </Text>
        </View>
      </View>
    </Modal>
  );

  const renderInfo = () => (
    <View className={`p-4 ${variant === 'compact' ? 'flex-1 p-3 justify-center' : ''} ${variant === 'detailed' ? 'p-4' : ''}`}>
      <View className="flex-row justify-between items-center px-3 pt-2">
        <Text className={`text-lg font-semibold text-gray-900 mb-2 ${variant === 'compact' ? 'text-base mb-1' : ''} ${variant === 'detailed' ? 'text-2xl mb-2' : ''}`}>
          {restaurant.name}
        </Text>
      </View>

      <View className="flex-row items-center mb-2">
        <View className="flex-row items-center mr-4">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text className="ml-1 text-sm text-gray-500">{restaurant.time}</Text>
        </View>
        <View className="flex-row items-center mr-4">
          <Ionicons name="star" size={16} color="#FBBF24" />
          <Text className="ml-1 text-sm text-gray-500">{restaurant.rating}</Text>
        </View>
        <View className="flex-row items-center mr-4">
          <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
          <Text className="ml-1 text-sm text-gray-500">{restaurant.price}</Text>
        </View>
      </View>

      <View className="flex-row items-center bg-gray-100 p-2 rounded-md">
        <Ionicons name="location" size={16} color="#6B7280" />
        <Text className="ml-1 text-sm text-gray-500">
          {restaurant.location}
        </Text>
      </View>

      {variant === 'detailed' && (
        <View className="mt-3 pt-3 border-t border-gray-200">
          <Text className="text-sm text-gray-600 mb-2">{restaurant.description}</Text>
          <Text className="text-base font-semibold text-green-600 mt-2">{restaurant.price}</Text>
        </View>
      )}
    </View>
  );

  const getCardClasses = () => {
    const baseClasses = 'w-full mb-4 bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300';
    switch (variant) {
      case 'compact':
        return `${baseClasses} flex-row h-24 mb-3`;
      case 'detailed':
        return `${baseClasses} mb-6`;
      default:
        return baseClasses;
    }
  };

  return (
    <>
      <TouchableOpacity
        className={`${getCardClasses()} ${localHighlighted ? 'border-[3px] border-blue-500 shadow-xl' : ''}`}
        onPress={handlePress}
      >
        {renderImage()}
        {renderInfo()}
      </TouchableOpacity>
      {renderImageModal()}
    </>
  );
}; 