import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, Platform, Linking, Modal, TextInput, Share, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Comment } from '@shared/data/types/comment';
import { SampleComments } from '@shared/data';
import { categories } from '@shared/data/constants/categories';
import { photoDetails } from '../styles/photoDetails';
import CameraComponent from '../components/CameraComponent';

export default function PhotoDetails() {
  const params = useLocalSearchParams();
  const { 
    id, 
    image, 
    name, 
    time, 
    rating, 
    location, 
    latitude, 
    longitude, 
    category, 
    price, 
    description,
    address,
    phone,
    website,
    openingHours,
    features,
    tags
  } = params;
  
  const [showMap, setShowMap] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [coordinates, setCoordinates] = useState<{latitude: number; longitude: number} | null>(null);
  const [comments, setComments] = useState<Comment[]>(SampleComments);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [updatedImage, setUpdatedImage] = useState<string>();
  
  // Parse image data
  const imageArray = typeof image === 'string' ? image.split(',').map(img => img.trim()) : [];
  
  const getCategoryIcon = (categoryId: string) => {
    const categoryData = categories.find(cat => cat.id === categoryId);
    return (categoryData?.icon as keyof typeof Ionicons.glyphMap) || 'restaurant-outline';
  };

  const getCategoryName = (categoryId: string) => {
    const categoryData = categories.find(cat => cat.id === categoryId);
    return categoryData?.name || 'Restaurant';
  };

  const getLocationCoordinates = async () => {
    try {
      if (latitude && longitude) {
        setCoordinates({
          latitude: parseFloat(latitude as string),
          longitude: parseFloat(longitude as string),
        });
        setShowMap(true);
      } else {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: parseFloat(params.latitude as string),
          longitude: parseFloat(params.longitude as string),
        });
        
        if (address) {
          setCoordinates({
            latitude: parseFloat(params.latitude as string),
            longitude: parseFloat(params.longitude as string),
          });
          setShowMap(true);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const openLocationInMaps = async () => {
    try {
      if (latitude && longitude) {
        const query = encodeURIComponent(location as string);
        const url = Platform.select({
          ios: `maps://${latitude},${longitude}?q=${query}`,
          android: `geo:${latitude},${longitude}?q=${query}`,
        });
        
        if (url) {
          await Linking.openURL(url);
        }
      } else {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: parseFloat(params.latitude as string),
          longitude: parseFloat(params.longitude as string),
        });
        
        if (address) {
          const query = encodeURIComponent(`${address.street || ''} ${address.city || ''} ${address.region || ''} ${address.country || ''}`);
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
      console.error('Error opening location:', error);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        userId: 'currentUser',
        restaurantId: id as string,
        rating: 0,
        text: newComment.trim(),
        likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
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
          ios: `maps://${params.latitude},${params.longitude}?q=${encodeURIComponent(locationText)}`,
          android: `geo:${params.latitude},${params.longitude}?q=${encodeURIComponent(locationText)}`,
        }),
      });

    } catch (error) {
      Alert.alert('Error', 'Failed to share location.');
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
    // Add the new photo to the existing image array
    const newImageArray = [...imageArray, photoUri];
    
    // Update the image parameter with the new array
    const newUpdatedImage = newImageArray.join(',');
    setUpdatedImage(newUpdatedImage);

    // Update the URL parameters with the new image
    router.setParams({
      ...params,
      image: newUpdatedImage
    });

    // Close the camera modal
    setShowCamera(false);
  };

  const handleBack = () => {
    if (updatedImage) {
      const data = {
        ...params,
        image: updatedImage,
        action: "update"
      };
      router.replace({
        pathname: "/",
        params: data
      });
    } else {
      router.back();
    }
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
        <ScrollView className={photoDetails.content} showsVerticalScrollIndicator={false}>
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
              snapToInterval={Dimensions.get('window').width}
              snapToAlignment="center"
            >
              {imageArray.map((img: string, index: number) => (
                <TouchableOpacity 
                  key={index} 
                  className="w-full h-full" 
                  style={{ 
                    width: Dimensions.get('window').width,
                    height: '100%'
                  }}
                  onPress={handleImagePress}
                >
                  <Image
                    source={{ uri: img }}
                    className={photoDetails.photo}
                    resizeMode="cover"
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      flex: 1
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
            <Text className={photoDetails.title}>{name}</Text>
            
            <View className={photoDetails.infoRow}>
              <View className={photoDetails.infoItem}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className={photoDetails.infoText}>{time}</Text>
              </View>
              <View className={photoDetails.infoItem}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text className={photoDetails.infoText}>{rating}</Text>
              </View>
              <View className={photoDetails.infoItem}>
                <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                <Text className={photoDetails.infoText}>{price}</Text>
              </View>
            </View>

            <View className={photoDetails.infoRow}>
              <View className={photoDetails.infoItem}>
                <Ionicons name={getCategoryIcon(category as string)} size={16} color="#6B7280" />
                <Text className={photoDetails.infoText}>{getCategoryName(category as string)}</Text>
              </View>
            </View>

            {description && (
              <View className={photoDetails.categoryDescriptionContainer}>
                <Text className={photoDetails.categoryDescriptionText}>{description}</Text>
              </View>
            )}

            <TouchableOpacity 
              className={photoDetails.locationContainer}
              onPress={getLocationCoordinates}
            >
              <Ionicons name="location" size={20} color="#6B7280" />
              <Text className={photoDetails.locationText}>{location || 'Location not specified'}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" className={photoDetails.locationArrow} />
            </TouchableOpacity>

            {address && (
              <View className={photoDetails.infoSection}>
                <Text className={photoDetails.sectionTitle}>Address</Text>
                <Text className={photoDetails.sectionText}>{address}</Text>
              </View>
            )}

            {phone && (
              <View className={photoDetails.infoSection}>
                <Text className={photoDetails.sectionTitle}>Phone</Text>
                <Text className={photoDetails.sectionText}>{phone}</Text>
              </View>
            )}

            {website && (
              <View className={photoDetails.infoSection}>
                <Text className={photoDetails.sectionTitle}>Website</Text>
                <TouchableOpacity onPress={() => Linking.openURL(website as string)}>
                  <Text className={`${photoDetails.sectionText} ${photoDetails.linkText}`}>{website}</Text>
                </TouchableOpacity>
              </View>
            )}

            {openingHours && (
              <View className={photoDetails.infoSection}>
                <Text className={photoDetails.sectionTitle}>Opening Hours</Text>
                <Text className={photoDetails.sectionText}>{openingHours}</Text>
              </View>
            )}

            {features && (
              <View className={photoDetails.infoSection}>
                <Text className={photoDetails.sectionTitle}>Features</Text>
                <View className={photoDetails.featuresContainer}>
                  {JSON.parse(features as string).map((feature: string, index: number) => (
                    <View key={index} className={photoDetails.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text className={photoDetails.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {tags && (
              <View className={photoDetails.infoSection}>
                <Text className={photoDetails.sectionTitle}>Tags</Text>
                <View className={photoDetails.tagsContainer}>
                  {JSON.parse(tags as string).map((tag: string, index: number) => (
                    <View key={index} className={photoDetails.tagItem}>
                      <Text className={photoDetails.tagText}>{tag}</Text>
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
            <Text className={photoDetails.actionText}>{comments.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity className={photoDetails.actionButton}>
            <Ionicons name="heart-outline" size={24} color="#6B7280" />
            <Text className={photoDetails.actionText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity className={photoDetails.actionButton} onPress={handleShare}>
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
              <Text className={photoDetails.modalTitle}>{location || 'Location'}</Text>
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
                    title={location as string}
                  />
                </MapView>
                <TouchableOpacity 
                  className={photoDetails.openMapsButton}
                  onPress={openLocationInMaps}
                >
                  <Ionicons name="navigate" size={20} color="#ffffff" />
                  <Text className={photoDetails.openMapsText}>Open in Maps</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showComments}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowComments(false)}
      >
        <View className={photoDetails.modalOverlay}>
          <View className={photoDetails.commentsModal}>
            <View className={photoDetails.modalHeader}>
              <Text className={photoDetails.modalTitle}>Comments</Text>
              <TouchableOpacity 
                className={photoDetails.closeButton}
                onPress={() => setShowComments(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView className={photoDetails.commentsList}>
              {comments.map((comment) => (
                <View key={comment.id} className={photoDetails.comment}>
                  <Image source={{ uri: 'https://randomuser.me/api/portraits/men/5.jpg' }} className={photoDetails.avatar} />
                  <View className={photoDetails.commentContent}>
                    <View className={photoDetails.commentHeader}>
                      <Text className={photoDetails.userName}>User {comment.userId}</Text>
                      <Text className={photoDetails.timestamp}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text className={photoDetails.commentText}>{comment.text}</Text>
                    <TouchableOpacity 
                      className={photoDetails.likeButton}
                      onPress={() => handleLikeComment(comment.id)}
                    >
                      <Ionicons 
                        name="heart-outline" 
                        size={16} 
                        color="#6B7280" 
                      />
                      <Text className={photoDetails.likeCount}>{comment.likes}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View className={photoDetails.commentInputContainer}>
              <TextInput
                className={photoDetails.modalCommentInput}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity 
                className={photoDetails.modalSendButton}
                onPress={handleAddComment}
              >
                <Ionicons name="send" size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            snapToInterval={Dimensions.get('window').width}
            snapToAlignment="center"
          >
            {imageArray.map((img: string, index: number) => (
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
                  className={photoDetails.fullImage}
                  resizeMode="contain"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    flex: 1
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