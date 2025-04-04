export interface Restaurant {
  id: string;
  name: string;
  image: string;
  time: string;
  rating: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  category: string;
  description?: string;
  price?: string;
}

export const featuredRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Italian Delight",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=1000&auto=format&fit=crop",
    time: "30 mins",
    rating: "4.8",
    location: "New York, NY",
    latitude: "40.7128",
    longitude: "-74.0060",
    category: "dinner",
    description: "Authentic Italian cuisine with fresh pasta and traditional dishes",
    price: "$$"
  },
  {
    id: "2",
    name: "Pizza Paradise",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=1000&auto=format&fit=crop",
    time: "45 mins",
    rating: "4.9",
    location: "Los Angeles, CA",
    latitude: "34.0522",
    longitude: "-118.2437",
    category: "dinner",
    description: "Best Neapolitan pizza in town with wood-fired oven",
    price: "$$"
  },
  {
    id: "3",
    name: "Fresh & Light",
    image: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=1000&auto=format&fit=crop",
    time: "20 mins",
    rating: "4.7",
    location: "Chicago, IL",
    latitude: "41.8781",
    longitude: "-87.6298",
    category: "lunch",
    description: "Fresh salads and healthy options for lunch",
    price: "$"
  },
  {
    id: "4",
    name: "Breakfast Haven",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000&auto=format&fit=crop",
    time: "15 mins",
    rating: "4.6",
    location: "Miami, FL",
    latitude: "25.7617",
    longitude: "-80.1918",
    category: "breakfast",
    description: "Best breakfast spot with fresh juices and bowls",
    price: "$$"
  },
  {
    id: "5",
    name: "Sushi Master",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop",
    time: "25 mins",
    rating: "4.9",
    location: "San Francisco, CA",
    latitude: "37.7749",
    longitude: "-122.4194",
    category: "lunch",
    description: "Premium sushi and Japanese cuisine",
    price: "$$$"
  },
  {
    id: "6",
    name: "Sweet Dreams",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d0227?q=80&w=1000&auto=format&fit=crop",
    time: "40 mins",
    rating: "4.8",
    location: "Boston, MA",
    latitude: "42.3601",
    longitude: "-71.0589",
    category: "desserts",
    description: "Artisanal desserts and pastries",
    price: "$$"
  },
  {
    id: "7",
    name: "Green Life",
    image: "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?q=80&w=1000&auto=format&fit=crop",
    time: "10 mins",
    rating: "4.5",
    location: "Seattle, WA",
    latitude: "47.6062",
    longitude: "-122.3321",
    category: "healthy",
    description: "Organic and healthy food options",
    price: "$$"
  },
  {
    id: "8",
    name: "Brew & Bites",
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=1000&auto=format&fit=crop",
    time: "5 mins",
    rating: "4.7",
    location: "Portland, OR",
    latitude: "45.5155",
    longitude: "-122.6789",
    category: "drinks",
    description: "Craft beer and pub food",
    price: "$$"
  }
]; 