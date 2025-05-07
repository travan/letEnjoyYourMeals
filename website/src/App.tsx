import { Routes, Route } from "react-router-dom";
import HomeScreen from "./pages/home";
import RestaurantItem from "./pages/item";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/restaurant/:id" element={<RestaurantItem />} />
    </Routes>
  );
}

export default App;
