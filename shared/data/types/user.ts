export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'restaurant_owner';
  preferences?: {
    favoriteCuisines?: string[];
    dietaryRestrictions?: string[];
    notificationSettings?: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
  };
  createdAt: string;
  lastLogin?: string;
} 