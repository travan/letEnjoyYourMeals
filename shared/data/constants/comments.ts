import { Comment } from '../types/comment';

export const SampleComments: Comment[] = [
  {
    id: '1',
    userId: '1',
    restaurantId: '1',
    rating: 5,
    text: 'Absolutely amazing experience! The pasta was cooked to perfection and the service was exceptional. Will definitely come back!',
    images: ['/images/comments/pasta-1.jpg', '/images/comments/pasta-2.jpg'],
    likes: 24,
    replies: [
      {
        id: '1-1',
        userId: '3',
        text: 'Thank you for your kind words! We\'re glad you enjoyed your experience.',
        likes: 5,
        createdAt: '2024-03-15T14:30:00Z',
      },
    ],
    createdAt: '2024-03-15T12:00:00Z',
  },
  {
    id: '2',
    userId: '2',
    restaurantId: '1',
    rating: 4,
    text: 'Great food and atmosphere. The tiramisu was the best I\'ve ever had!',
    likes: 12,
    createdAt: '2024-03-16T18:45:00Z',
  },
  {
    id: '3',
    userId: '1',
    restaurantId: '2',
    rating: 5,
    text: 'The sushi was incredibly fresh and the presentation was beautiful. The chef\'s special roll was a highlight!',
    images: ['/images/comments/sushi-1.jpg'],
    likes: 18,
    replies: [
      {
        id: '3-1',
        userId: '2',
        text: 'I agree! Their special rolls are always amazing.',
        likes: 3,
        createdAt: '2024-03-17T09:15:00Z',
      },
    ],
    createdAt: '2024-03-17T08:30:00Z',
  },
  {
    id: '4',
    userId: '2',
    restaurantId: '3',
    rating: 4,
    text: 'Authentic Mexican flavors with a modern twist. The tacos were delicious and the margaritas were perfect!',
    likes: 15,
    createdAt: '2024-03-18T20:00:00Z',
  },
]; 