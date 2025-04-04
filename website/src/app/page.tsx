'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CameraIcon, BellIcon } from '@heroicons/react/24/outline';
import { Restaurant, featuredRestaurants } from '@/data/restaurants';
import { categories } from '@/data/categories';
import RestaurantCard from '@/components/RestaurantCard';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [highlightedRestaurants, setHighlightedRestaurants] = useState<Set<string>>(new Set());

  // Filter restaurants based on search query and selected category
  const filteredRestaurants = useMemo(() => {
    return featuredRestaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (restaurant.location?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (restaurant.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesCategory = selectedTab === 'all' || restaurant.category === selectedTab;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedTab]);

  const handlePhotoPress = (image: string) => {
    // TODO: Implement photo preview modal
    console.log('Photo pressed:', image);
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    router.push(`/restaurants/${restaurant.id}`);
  };

  const handleHighlight = (restaurantId: string) => {
    setHighlightedRestaurants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(restaurantId)) {
        newSet.delete(restaurantId);
      } else {
        newSet.add(restaurantId);
      }
      return newSet;
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Let&apos;s Enjoy Your Food</h1>
          <div className="flex gap-4">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => router.push('/take-photo')}
            >
              <CameraIcon className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <BellIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search restaurants..."
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`flex flex-col items-center space-y-2 min-w-[80px] ${
                  selectedTab === category.id ? 'text-primary-600' : 'text-gray-600'
                }`}
                onClick={() => setSelectedTab(category.id)}
              >
                <div
                  className={`p-3 rounded-full ${
                    selectedTab === category.id ? 'bg-primary-100' : 'bg-gray-100'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Restaurants Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {searchQuery ? 'Search Results' : 'Popular Restaurants'}
          </h2>
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="mt-4 text-gray-600">No restaurants found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  onClick={() => handleRestaurantPress(restaurant)}
                  className="cursor-pointer"
                >
                  <RestaurantCard
                    restaurant={restaurant}
                    onPhotoPress={handlePhotoPress}
                    onHighlight={handleHighlight}
                    isHighlighted={highlightedRestaurants.has(restaurant.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
