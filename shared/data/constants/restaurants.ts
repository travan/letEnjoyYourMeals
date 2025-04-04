import { Restaurant } from '../types/restaurant';

export const featuredRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Pasta Paradise',
    image: [
      'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.8,
    time: '11:00 AM - 10:00 PM',
    price: '$$',
    location: '123 Main St, New York',
    description: 'Authentic Italian cuisine with a modern twist. Our handmade pasta and fresh ingredients will transport you to the heart of Italy.',
    category: 'Italian',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060,
    },
    operatingHours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'info@pastaparadise.com',
      website: 'www.pastaparadise.com',
    },
    features: ['Outdoor Seating', 'Wheelchair Accessible', 'Reservations', 'Takeout'],
  },
  {
    id: '2',
    name: 'Sushi Master',
    image: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.9,
    time: '12:00 PM - 11:00 PM',
    price: '$$$',
    location: '456 Oak Ave, Los Angeles',
    description: 'Experience the art of sushi making with our master chefs. Fresh fish flown in daily from Japan.',
    category: 'Japanese',
    coordinates: {
      latitude: 34.0522,
      longitude: -118.2437,
    },
    operatingHours: {
      monday: { open: '12:00', close: '23:00' },
      tuesday: { open: '12:00', close: '23:00' },
      wednesday: { open: '12:00', close: '23:00' },
      thursday: { open: '12:00', close: '23:00' },
      friday: { open: '12:00', close: '00:00' },
      saturday: { open: '12:00', close: '00:00' },
      sunday: { open: '12:00', close: '22:00' },
    },
    contact: {
      phone: '+1 (555) 234-5678',
      email: 'reservations@sushimaster.com',
      website: 'www.sushimaster.com',
    },
    features: ['Sushi Bar', 'Private Dining', 'Reservations', 'Takeout'],
  },
  {
    id: '3',
    name: 'Taco Fiesta',
    image: [
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.5,
    time: '10:00 AM - 10:00 PM',
    price: '$',
    location: '789 Pine St, Chicago',
    description: 'Vibrant Mexican street food with a modern twist. Our tacos are made with fresh, locally-sourced ingredients.',
    category: 'Mexican',
    coordinates: {
      latitude: 41.8781,
      longitude: -87.6298,
    },
    operatingHours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '23:00' },
      friday: { open: '10:00', close: '23:00' },
      saturday: { open: '09:00', close: '23:00' },
      sunday: { open: '09:00', close: '22:00' },
    },
    contact: {
      phone: '+1 (555) 345-6789',
      email: 'info@tacofiesta.com',
      website: 'www.tacofiesta.com',
    },
    features: ['Outdoor Seating', 'Family Friendly', 'Takeout', 'Delivery'],
  },
  {
    id: '4',
    name: 'Bao House',
    image: [
      'https://images.unsplash.com/photo-1565299507177-b0ac4448a3b5?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1565299507177-b0ac4448a3b5?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1565299507177-b0ac4448a3b5?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.7,
    time: '11:00 AM - 10:00 PM',
    price: '$$',
    location: '321 Elm St, San Francisco',
    description: 'Modern Asian fusion restaurant specializing in steamed buns and small plates. A perfect blend of traditional and contemporary flavors.',
    category: 'Asian',
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    operatingHours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    contact: {
      phone: '+1 (555) 456-7890',
      email: 'hello@baohouse.com',
      website: 'www.baohouse.com',
    },
    features: ['Vegetarian Options', 'Craft Cocktails', 'Reservations', 'Takeout'],
  },
  {
    id: '5',
    name: 'The Burger Joint',
    image: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.6,
    time: '11:00 AM - 11:00 PM',
    price: '$$',
    location: '654 Maple St, Austin',
    description: 'Gourmet burgers made with locally-sourced beef and artisanal buns. Our secret sauce will keep you coming back for more.',
    category: 'American',
    coordinates: {
      latitude: 30.2672,
      longitude: -97.7431,
    },
    operatingHours: {
      monday: { open: '11:00', close: '23:00' },
      tuesday: { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday: { open: '11:00', close: '00:00' },
      friday: { open: '11:00', close: '00:00' },
      saturday: { open: '10:00', close: '00:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    contact: {
      phone: '+1 (555) 567-8901',
      email: 'info@burgerjoint.com',
      website: 'www.burgerjoint.com',
    },
    features: ['Craft Beer', 'Outdoor Seating', 'Family Friendly', 'Takeout'],
  },
  {
    id: '6',
    name: 'Curry House',
    image: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.7,
    time: '11:00 AM - 10:00 PM',
    price: '$$',
    location: '234 Spice Lane, Seattle',
    description: 'Authentic Indian cuisine with a wide variety of curries, tandoori dishes, and traditional breads. Experience the rich flavors of India.',
    category: 'Indian',
    coordinates: {
      latitude: 47.6062,
      longitude: -122.3321,
    },
    operatingHours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    contact: {
      phone: '+1 (555) 678-9012',
      email: 'info@curryhouse.com',
      website: 'www.curryhouse.com',
    },
    features: ['Vegetarian Options', 'Spicy Food', 'Takeout', 'Delivery'],
  },
  {
    id: '7',
    name: 'Pho Express',
    image: [
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.6,
    time: '10:00 AM - 9:00 PM',
    price: '$',
    location: '789 Rice Street, Houston',
    description: 'Traditional Vietnamese pho and other authentic dishes. Our broth is simmered for 12 hours to achieve the perfect flavor.',
    category: 'Vietnamese',
    coordinates: {
      latitude: 29.7604,
      longitude: -95.3698,
    },
    operatingHours: {
      monday: { open: '10:00', close: '21:00' },
      tuesday: { open: '10:00', close: '21:00' },
      wednesday: { open: '10:00', close: '21:00' },
      thursday: { open: '10:00', close: '21:00' },
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '21:00' },
    },
    contact: {
      phone: '+1 (555) 789-0123',
      email: 'hello@phoexpress.com',
      website: 'www.phoexpress.com',
    },
    features: ['Quick Service', 'Takeout', 'Delivery', 'Family Friendly'],
  },
  {
    id: '8',
    name: 'Mediterranean Delight',
    image: [
      'https://images.unsplash.com/photo-1559847844-1ff4d5bcd1c3?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1559847844-1ff4d5bcd1c3?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1559847844-1ff4d5bcd1c3?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.8,
    time: '11:00 AM - 10:00 PM',
    price: '$$',
    location: '456 Olive Street, Miami',
    description: 'Experience the flavors of the Mediterranean with our fresh seafood, grilled meats, and authentic meze platters.',
    category: 'Mediterranean',
    coordinates: {
      latitude: 25.7617,
      longitude: -80.1918,
    },
    operatingHours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    contact: {
      phone: '+1 (555) 890-1234',
      email: 'info@mediterraneandelight.com',
      website: 'www.mediterraneandelight.com',
    },
    features: ['Outdoor Seating', 'Vegetarian Options', 'Wine Bar', 'Reservations'],
  },
  {
    id: '9',
    name: 'BBQ Pit',
    image: [
      'https://images.unsplash.com/photo-1558030009-02ec6c94c0c5?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1558030009-02ec6c94c0c5?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1558030009-02ec6c94c0c5?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.9,
    time: '11:00 AM - 11:00 PM',
    price: '$$',
    location: '123 Smoke Street, Nashville',
    description: 'Authentic Southern BBQ with slow-smoked meats, homemade sauces, and classic sides. Our ribs are fall-off-the-bone tender.',
    category: 'BBQ',
    coordinates: {
      latitude: 36.1627,
      longitude: -86.7816,
    },
    operatingHours: {
      monday: { open: '11:00', close: '23:00' },
      tuesday: { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '00:00' },
      saturday: { open: '10:00', close: '00:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    contact: {
      phone: '+1 (555) 901-2345',
      email: 'info@bbqpit.com',
      website: 'www.bbqpit.com',
    },
    features: ['Live Music', 'Outdoor Seating', 'Family Friendly', 'Takeout'],
  },
  {
    id: '10',
    name: 'Dumpling House',
    image: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.7,
    time: '11:00 AM - 10:00 PM',
    price: '$$',
    location: '789 Noodle Avenue, Boston',
    description: 'Handmade dumplings and authentic Chinese cuisine. Watch our chefs prepare fresh dumplings in our open kitchen.',
    category: 'Chinese',
    coordinates: {
      latitude: 42.3601,
      longitude: -71.0589,
    },
    operatingHours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    contact: {
      phone: '+1 (555) 012-3456',
      email: 'info@dumplinghouse.com',
      website: 'www.dumplinghouse.com',
    },
    features: ['Open Kitchen', 'Vegetarian Options', 'Takeout', 'Delivery'],
  }
]; 