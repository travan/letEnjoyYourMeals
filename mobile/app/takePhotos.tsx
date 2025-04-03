import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Platform, Alert, Share } from "react-native";
import { CameraView, CameraType, FlashMode, useCameraPermissions } from "expo-camera";
import * as Location from 'expo-location';
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { styles } from "./styles/takePhotos";

export default function TakePhotos() {
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{latitude: number; longitude: number} | null>(null);
  const cameraRef = useRef<CameraView>(null);

  React.useEffect(() => {
    (async () => {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission, requestPermission]);

  const getLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (address) {
        const locationString = `${address.city || ''}${address.city && address.region ? ', ' : ''}${address.region || ''}`;
        setLocation(locationString);
        setCoordinates({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocation(null);
      setCoordinates(null);
    }
  };

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          await getLocation();
          setPhotoUri(photo.uri);
        }
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
  };

  const handleShare = () => {
    if (photoUri) {
      try {
        const shareData = {
          photoUri,
          location: location || 'Location not available',
          latitude: coordinates?.latitude?.toString() || '',
          longitude: coordinates?.longitude?.toString() || '',
          timestamp: new Date().getTime(),
          action: 'addPhoto'
        };

        router.replace({
          pathname: '/',
          params: shareData
        });
      } catch (error) {
        console.error('Error sharing photo:', error);
      }
    }
  };

  const toggleCameraType = () => {
    setType(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!photoUri ? (
        <>
          <View style={styles.camera}>
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                <CameraView
                  ref={cameraRef}
                  style={{ flex: 1 }}
                  facing={type}
                  enableTorch={flash === 'on'}
                />
                <View style={styles.controls}>
                  <TouchableOpacity style={styles.galleryButton} onPress={handlePickImage}>
                    <Ionicons name="images-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.flashButton}
                    onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
                  >
                    <Ionicons
                      name={flash === 'off' ? "flash-off" : "flash"}
                      size={24}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.flipButton}
                  onPress={toggleCameraType}
                >
                  <Ionicons 
                    name="camera-reverse" 
                    size={24} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.previewButton} onPress={handleRetake}>
              <Ionicons name="close-circle" size={32} color="#6B7280" />
              <Text style={styles.previewButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewButton} onPress={() => router.push('/takePhotos')}>
              <Ionicons name="camera" size={32} color="#DC2626" />
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewButton} onPress={handleShare}>
              <Ionicons name="checkmark-circle" size={32} color="#059669" />
              <Text style={styles.previewButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
