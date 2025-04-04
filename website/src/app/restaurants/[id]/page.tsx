'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { featuredRestaurants } from '@/data/restaurants';
import Icon from '@/components/Icon';

interface RestaurantDetailProps {
  params: {
    id: string;
  };
}

export default function RestaurantDetail({ params }: RestaurantDetailProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const restaurant = featuredRestaurants.find(r => r.id === params.id);

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setShowImagePreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Preview Modal */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl w-full mx-4">
            <Image
              src={selectedImage}
              alt="Restaurant preview"
              width={1200}
              height={800}
              className="rounded-lg"
            />
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            >
              <Icon name="close" className="text-gray-900" size="lg" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <Icon name="arrow-left" className="mr-2" size="md" />
          Back to Home
        </button>

        {/* Restaurant Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-96">
            <Image
              src={restaurant.image}
              alt={restaurant.name}
              fill
              className="object-cover"
              onClick={() => handleImageClick(restaurant.image)}
            />
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            >
              <Icon 
                name={isFavorite ? 'heart-solid' : 'heart'} 
                className={isFavorite ? 'text-red-500' : 'text-gray-600'}
                size="lg"
              />
            </button>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon name="map-pin" size="md" />
                  <span>{restaurant.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="star" className="text-yellow-400" size="lg" />
                <span className="text-xl font-semibold">{restaurant.rating}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Icon name="clock" size="md" />
                <span>{restaurant.time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Icon name="currency" size="md" />
                <span>{restaurant.price}</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-gray-600">{restaurant.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <div className="aspect-video bg-gray-200 rounded-lg">
                {/* TODO: Add map component */}
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Map will be displayed here
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                Make Reservation
              </button>
              <button className="flex-1 px-6 py-3 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 transition-colors">
                Order Online
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 