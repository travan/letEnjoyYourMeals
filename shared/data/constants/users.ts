import { User } from '../types/user';

export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/images/avatars/john-doe.jpg',
    role: 'user',
    preferences: {
      favoriteCuisines: ['Italian', 'Japanese'],
      dietaryRestrictions: ['Vegetarian'],
      notificationSettings: {
        email: true,
        push: true,
        marketing: false,
      },
    },
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-03-20T15:30:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: '/images/avatars/jane-smith.jpg',
    role: 'user',
    preferences: {
      favoriteCuisines: ['Mexican', 'Thai'],
      dietaryRestrictions: [],
      notificationSettings: {
        email: true,
        push: false,
        marketing: true,
      },
    },
    createdAt: '2024-01-15T00:00:00Z',
    lastLogin: '2024-03-19T10:15:00Z',
  },
  {
    id: '3',
    name: 'Chef Marco',
    email: 'marco@pastaparadise.com',
    avatar: '/images/avatars/chef-marco.jpg',
    role: 'restaurant_owner',
    preferences: {
      favoriteCuisines: ['Italian'],
      notificationSettings: {
        email: true,
        push: true,
        marketing: true,
      },
    },
    createdAt: '2024-02-01T00:00:00Z',
    lastLogin: '2024-03-20T09:00:00Z',
  },
  {
    id: '4',
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '/images/avatars/admin.jpg',
    role: 'admin',
    preferences: {
      notificationSettings: {
        email: true,
        push: true,
        marketing: false,
      },
    },
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-03-20T16:45:00Z',
  },
]; 