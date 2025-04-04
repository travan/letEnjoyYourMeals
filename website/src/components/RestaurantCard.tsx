import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '@/data/restaurants';
import Icon from './Icon';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPhotoPress?: (image: string) => void;
  onHighlight?: (restaurantId: string) => void;
  isHighlighted?: boolean;
  variant?: 'default' | 'compact';
}

export default function RestaurantCard({
  restaurant,
  onPhotoPress,
  onHighlight,
  isHighlighted = false,
  variant = 'default',
}: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${restaurant.id}`} className="block">
      <div className={`bg-white rounded-lg overflow-hidden shadow-md ${variant === 'default' ? 'w-full' : 'w-48'}`}>
        <div className="relative aspect-video">
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            className="object-cover"
            onClick={(e) => {
              e.preventDefault();
              onPhotoPress?.(restaurant.image);
            }}
          />
          <button
            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white/90 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              onHighlight?.(restaurant.id);
            }}
          >
            <Icon 
              name={isHighlighted ? 'heart-solid' : 'heart'} 
              className={isHighlighted ? 'text-red-500' : 'text-gray-600'}
              size="md"
            />
          </button>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{restaurant.name}</h3>
            <div className="flex items-center gap-1">
              <Icon name="star" className="text-yellow-400" size="sm" />
              <span className="text-sm font-medium">{restaurant.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>{restaurant.time}</span>
            <span>•</span>
            <span>{restaurant.price}</span>
          </div>
          {restaurant.location && (
            <p className="text-sm text-gray-600">{restaurant.location}</p>
          )}
        </div>
      </div>
    </Link>
  );
} 