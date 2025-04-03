import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, Platform, Linking, Modal, TextInput, Alert, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { sampleComments, Comment } from '../data/comments';
import { styles } from '../styles/photoDetails';

export default function PhotoDetails() {
  const params = useLocalSearchParams();
  const { id, image, name, time, rating, location, latitude, longitude } = params;
  const [showMap, setShowMap] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [coordinates, setCoordinates] = useState<{latitude: number; longitude: number} | null>(null);
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

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
        userName: 'You',
        userAvatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        content: newComment.trim(),
        timestamp: 'Just now',
        likes: 0,
        isLiked: false
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1, isLiked: !comment.isLiked }
        : comment
    ));
  };

  const handleShare = async () => {
    try {
      const locationText = params.location as string;
      const coordinates = `${params.latitude},${params.longitude}`;
      const shareMessage = `Check out this place: ${locationText}\nLocation: ${coordinates}`;
      
      const result = await Share.share({
        message: shareMessage,
        title: locationText,
        url: Platform.select({
          ios: `maps://${params.latitude},${params.longitude}?q=${encodeURIComponent(locationText)}`,
          android: `geo:${params.latitude},${params.longitude}?q=${encodeURIComponent(locationText)}`,
        }),
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Details</Text>
      </View>

      <View style={styles.mainContent}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setShowFullImage(true)}>
            <Image
              source={{ uri: image as string }}
              style={styles.photo}
              resizeMode="cover"
            />
          </TouchableOpacity>
          
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{name}</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{time}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="star" size={20} color="#FBBF24" />
                <Text style={styles.infoText}>{rating}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.locationContainer}
              onPress={getLocationCoordinates}
            >
              <Ionicons name="location" size={20} color="#6B7280" />
              <Text style={styles.locationText}>{location || 'Location not specified'}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" style={styles.locationArrow} />
            </TouchableOpacity>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={() => setShowComments(!showComments)}>
                <Ionicons name="chatbubble-outline" size={24} color="#6B7280" />
                <Text style={styles.actionText}>{comments.length}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="heart-outline" size={24} color="#6B7280" />
                <Text style={styles.actionText}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="#6B7280" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>

            {showComments && (
              <View style={styles.commentsSection}>
                <View style={styles.commentInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                  />
                  <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
                    <Ionicons name="send" size={24} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
                {comments.map((comment) => (
                  <View key={comment.id} style={styles.comment}>
                    <Image source={{ uri: comment.userAvatar }} style={styles.avatar} />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.userName}>{comment.userName}</Text>
                        <Text style={styles.timestamp}>{comment.timestamp}</Text>
                      </View>
                      <Text style={styles.commentText}>{comment.content}</Text>
                      <TouchableOpacity 
                        style={styles.likeButton}
                        onPress={() => handleLikeComment(comment.id)}
                      >
                        <Ionicons 
                          name={comment.isLiked ? "heart" : "heart-outline"} 
                          size={16} 
                          color={comment.isLiked ? "#DC2626" : "#6B7280"} 
                        />
                        <Text style={styles.likeCount}>{comment.likes}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {showMap && coordinates && (
          <View style={styles.mapSection}>
            <View style={styles.mapHeader}>
              <Text style={styles.mapTitle}>Location</Text>
              <TouchableOpacity 
                style={styles.closeMapButton}
                onPress={() => setShowMap(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
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
              style={styles.openMapsButton}
              onPress={openLocationInMaps}
            >
              <Ionicons name="navigate" size={20} color="#ffffff" />
              <Text style={styles.openMapsText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowFullImage(false)}
          >
            <Ionicons name="close" size={30} color="#ffffff" />
          </TouchableOpacity>
          <Image
            source={{ uri: image as string }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
} 