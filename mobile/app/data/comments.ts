export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

export const sampleComments: Comment[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    content: 'This place looks amazing! The food presentation is beautiful.',
    timestamp: '2 hours ago',
    likes: 12,
    isLiked: false
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Mike Chen',
    userAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    content: 'Been here twice, the service is excellent and the food is delicious!',
    timestamp: '5 hours ago',
    likes: 8,
    isLiked: true
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Emma Davis',
    userAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    content: 'The atmosphere is perfect for a date night. Will definitely come back!',
    timestamp: '1 day ago',
    likes: 15,
    isLiked: false
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Alex Thompson',
    userAvatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    content: 'Great location and amazing food! The chef is really talented.',
    timestamp: '2 days ago',
    likes: 6,
    isLiked: false
  }
]; 