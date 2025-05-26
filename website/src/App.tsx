import { Routes, Route } from "react-router-dom";
import HomeScreen from "./pages/home";
import RestaurantItem from "./pages/item";
import { useEffect, useRef } from "react";
import { useAuthStore } from "./store/authStore";
import LoadingScreen from "./components/LoadingScreen";
import { Toaster } from "react-hot-toast";

function App() {
  const { loadSession, authenticate, isAuthenticated } = useAuthStore();
  const calledRef = useRef(false);
  const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(
          new Error("Geolocation is not supported by this browser.")
        );
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
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

  return (
    <>
      {isAuthenticated && <Toaster position="bottom-right" />}
      <Routes>
        {isAuthenticated ? (
          <>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/restaurant/:id" element={<RestaurantItem />} />
          </>
        ) : (
          <Route path="*" element={<LoadingScreen />} />
        )}
      </Routes>
    </>
  );
}

export default App;
