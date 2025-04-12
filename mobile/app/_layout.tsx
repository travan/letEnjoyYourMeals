import { Slot } from "expo-router";
import "./global.css";
import { RestaurantProvider } from "./contexts/RestaurantContext";

export default function RootLayout() {
  return (
    <RestaurantProvider>
      <Slot />
    </RestaurantProvider>
  );
}
