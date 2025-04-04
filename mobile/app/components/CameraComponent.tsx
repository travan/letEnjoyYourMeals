import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Platform, Alert, SafeAreaView, Dimensions, Linking } from "react-native";
import { CameraView, CameraType, FlashMode, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker'

interface CameraComponentProps {
  onPhotoTaken?: (photoUri: string) => void;
  showPreview?: boolean;
  onRetake?: () => void;
  onClose?: () => void;
}

export default function CameraComponent({ onPhotoTaken, showPreview = true, onRetake, onClose }: CameraComponentProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const initializeCamera = async () => {
      try {
        const { status } = await requestPermission();
        
        if (mountedRef.current) {
          if (status === 'granted') {
            setIsCameraInitialized(true);
          } else {
            if (Platform.OS === 'ios') {
              Alert.alert(
                "Camera Access Required",
                "Please enable camera access in your iPhone settings:\n\n1. Open Settings\n2. Scroll down to find this app\n3. Tap on it\n4. Enable Camera access",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Open Settings", onPress: () => Linking.openURL('app-settings:') }
                ]
              );
            } else {
              Alert.alert(
                "Camera Permission Required",
                "Please grant camera access to take photos.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Open Settings", onPress: () => Linking.openSettings() }
                ]
              );
            }
          }
        }
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        if (mountedRef.current) {
          Alert.alert("Error", "Failed to request camera permission. Please try again.");
        }
      }
    };

    initializeCamera();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera is not available.');
      return;
    }

    if (isTakingPhoto) {
      Alert.alert('Please wait', 'Already processing a photo.');
      return;
    }

    try {
      setIsTakingPhoto(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
        exif: true,
        base64: true,
      });
      
      if (onPhotoTaken && photo) {
        onPhotoTaken(photo.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required",
          "Please grant access to your photo library to select images.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }}
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        if (onPhotoTaken) {
          onPhotoTaken(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
    if (onRetake) {
      onRetake();
    }
  };

  const toggleCameraType = () => {
    setType(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission?.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900 p-6">
        <Ionicons name="camera-outline" size={64} color="#fff" />
        <Text className="text-white text-xl font-bold mt-4 mb-2">Camera Access Required</Text>
        <Text className="text-gray-300 text-center mb-6">
          This app needs access to your camera to take photos. Please grant permission to continue.
        </Text>
        <TouchableOpacity 
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={requestPermission}
        >
          <Text className="text-white font-medium">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {!photoUri || !showPreview ? (
        <View className="flex-1 bg-black">
          <CameraView
            ref={cameraRef}
            className="flex-1"
            facing={type}
            enableTorch={flash === 'on'}
            onCameraReady={handleCameraReady}
            style={{ flex: 1 }}
          />
          <View className="absolute top-0 left-0 right-0 flex-row justify-between p-4">
            <TouchableOpacity 
              className="w-10 h-10 items-center justify-center rounded-full bg-black/50"
              onPress={onClose || (() => router.back())}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-10 h-10 items-center justify-center rounded-full bg-black/50"
              onPress={toggleCameraType}
            >
              <Ionicons name="camera-reverse" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View className="absolute bottom-0 left-0 right-0 flex-row justify-between items-center p-4">
            <TouchableOpacity 
              className="w-12 h-12 items-center justify-center rounded-full bg-black/50"
              onPress={handlePickImage}
            >
              <Ionicons name="images-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              className={[
                "w-16 h-16 rounded-full border-4 border-white items-center justify-center",
                !isCameraReady && "opacity-50"
              ].filter(Boolean).join(' ')}
              onPress={handleTakePhoto}
              disabled={!isCameraReady}
            >
              <View className="w-12 h-12 rounded-full bg-white" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-12 h-12 items-center justify-center rounded-full bg-black/50"
              onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
            >
              <Ionicons
                name={flash === 'off' ? "flash-off" : "flash"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex-1 bg-black">
          <Image 
            source={{ uri: photoUri }} 
            className="flex-1"
            style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.7 }}
            resizeMode="contain"
          />
          <View className="absolute bottom-0 left-0 right-0 flex-row justify-center p-4">
            <TouchableOpacity
              className="flex-row items-center bg-blue-500 px-6 py-3 rounded-lg"
              onPress={handleRetake}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text className="text-white font-medium ml-2">Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
} 