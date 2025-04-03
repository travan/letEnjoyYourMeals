import { Stack } from "expo-router";
import "./global.css";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="takePhotos" options={{ headerShown: false }} />
      <Stack.Screen name="photos/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
