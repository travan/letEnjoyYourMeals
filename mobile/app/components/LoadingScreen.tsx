import { View, ActivityIndicator, Text } from "react-native";
import React from "react";

export default function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#6366F1" />
      <Text className="mt-4 text-lg text-gray-500">Loading...</Text>
    </View>
  );
}