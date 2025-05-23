import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { useRestaurantStore } from "../store/restaurantStore";
import { useCommentStore } from "../store/commentStore";
import { Feather } from "@expo/vector-icons";

const SyncIndicator: React.FC = () => {
  const restaurantPending = useRestaurantStore((state) => state.pendingChanges);
  const commentPending = useCommentStore((state) => state.pendingChanges);
  const forceSyncRestaurants = useRestaurantStore((state) => state.forceSyncChanges);
  const forceSyncComments = useCommentStore((state) => state.forceSyncChanges);

  const totalPending = restaurantPending + commentPending;
  const [showSaved, setShowSaved] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (totalPending === 0) {
      setShowSaved(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [totalPending]);

  useEffect(() => {
    if (showSaved) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowSaved(false));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSaved]);

  const handleForceSync = async () => {
    await Promise.all([forceSyncRestaurants(), forceSyncComments()]);
  };

  if (showSaved) {
    return (
      <Animated.View
        className="absolute top-5 right-5 z-50 flex-row items-center space-x-2 bg-green-100 px-4 py-2 rounded-xl shadow-md"
        style={{ opacity: fadeAnim }}
      >
        <Feather name="check-circle" size={20} color="#166534" />
        <Text className="text-green-800 font-medium">All changes saved</Text>
      </Animated.View>
    );
  }

  if (totalPending > 0) {
    return (
      <View className="absolute top-5 right-5 z-50 flex-row items-center space-x-3 bg-yellow-100 px-4 py-2 rounded-xl shadow-md">
        <ActivityIndicator size="small" color="#92400e" />
        <Text className="text-yellow-800 font-medium">{totalPending} waiting to sync</Text>
        <TouchableOpacity
          onPress={handleForceSync}
          className="bg-yellow-500 px-3 py-1 rounded-md"
          activeOpacity={0.8}
        >
          <Text className="text-white text-sm font-semibold">Sync now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

export default SyncIndicator;
