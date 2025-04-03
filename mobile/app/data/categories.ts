export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "all", name: "All", icon: "grid-outline" },
  { id: "breakfast", name: "Breakfast", icon: "sunny-outline" },
  { id: "lunch", name: "Lunch", icon: "restaurant-outline" },
  { id: "dinner", name: "Dinner", icon: "moon-outline" },
  { id: "snacks", name: "Snacks", icon: "cafe-outline" },
  { id: "desserts", name: "Desserts", icon: "ice-cream-outline" },
  { id: "drinks", name: "Drinks", icon: "beer-outline" },
  { id: "healthy", name: "Healthy", icon: "leaf-outline" },
]; 