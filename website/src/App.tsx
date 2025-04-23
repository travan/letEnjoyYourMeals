import { Routes, Route } from "react-router-dom";
import HomeScreen from "./pages/home";
import RestaurantItem from "./pages/item";
// import { RestaurantProvider } from "./contexts/RestaurantContext";

function App() {
  return (
    // <RestaurantProvider>
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/restaurant/:id" element={<RestaurantItem />} />
    </Routes>
    // </RestaurantProvider>
  );
}

export default App;
