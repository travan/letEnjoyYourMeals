import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Restaurant } from '../data/index';
import { styles } from '../styles/index';

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
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
        }
      });
    }
  };

  const renderImage = () => (
    <TouchableOpacity
      onPress={() => onPhotoPress?.(restaurant.image)}
      disabled={!onPhotoPress}
    >
      <Image
        source={{ uri: restaurant.image }}
        style={[
          styles.restaurantImage,
          variant === 'compact' && styles.restaurantImageCompact,
          variant === 'detailed' && styles.restaurantImageDetailed,
        ]}
      />
    </TouchableOpacity>
  );

  const renderInfo = () => (
    <View style={[
      styles.restaurantInfo,
      variant === 'compact' && styles.restaurantInfoCompact,
      variant === 'detailed' && styles.restaurantInfoDetailed,
    ]}>
      <View style={styles.restaurantHeader}>
        <Text style={[
          styles.restaurantName,
          variant === 'compact' && styles.restaurantNameCompact,
          variant === 'detailed' && styles.restaurantNameDetailed,
        ]}>
          {restaurant.name}
        </Text>
        {showHighlightButton && onHighlight && (
          <TouchableOpacity
            onPress={() => onHighlight(restaurant.id)}
            style={styles.highlightButton}
          >
            <Ionicons
              name={isHighlighted ? "star" : "star-outline"}
              size={24}
              color={isHighlighted ? "#FBBF24" : "#6B7280"}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.restaurantDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{restaurant.time}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="star" size={16} color="#FBBF24" />
          <Text style={styles.detailText}>{restaurant.rating}</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <Ionicons name="location" size={16} color="#6B7280" />
        <Text style={styles.locationText}>
          {restaurant.location}
        </Text>
      </View>

      {variant === 'detailed' && (
        <View style={styles.restaurantDescription}>
          <Text style={styles.descriptionText}>{restaurant.description}</Text>
          <Text style={styles.priceText}>{restaurant.price}</Text>
        </View>
      )}
    </View>
  );

  const getCardStyle = () => {
    switch (variant) {
      case 'compact':
        return {
          ...styles.restaurantCard,
          ...styles.restaurantCardCompact,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 12,
        };
      case 'detailed':
        return {
          ...styles.restaurantCard,
          ...styles.restaurantCardDetailed,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 12,
        };
      default:
        return {
          ...styles.restaurantCard,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 12,
        };
    }
  };

  const cardStyle = [
    getCardStyle(),
    isHighlighted && styles.highlightedCard,
  ];

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={handlePress}
    >
      {renderImage()}
      {renderInfo()}
    </TouchableOpacity>
  );
}; 