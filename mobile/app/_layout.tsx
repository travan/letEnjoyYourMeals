import { Slot } from "expo-router";
import "./global.css";
import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { useAuthStore } from "./store/authStore";
import LoadingScreen from "./components/LoadingScreen";

export default function RootLayout() {
  const { loadSession, authenticate, isAuthenticated, session } = useAuthStore();
  const calledRef = useRef(false);
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permission to access location was denied");
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  useEffect(() => {
    const autoLogin = async () => {
      if (calledRef.current) return;
      calledRef.current = true;

      try {
        await loadSession();
      } catch {
        try {
          const location = await getLocation();
          await authenticate(location);
        } catch (err) {
          console.error("Failed to get location or authenticate:", err);
        }
      }
    };

    autoLogin();
  }, [loadSession, authenticate]);

  if (isAuthenticated) {
    return <Slot />;
  } else {
    return <LoadingScreen />;
  }
}
