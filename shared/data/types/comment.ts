export interface Comment {
  id: string;
  userId: string;
  restaurantId: string;
  rating: number;
  text: string;
  images?: string[];
  likes: number;
  replies?: Reply[];
  createdAt: string;
  updatedAt?: string;
}

export interface Reply {
  id: string;
  userId: string;
  text: string;
  likes: number;
  createdAt: string;
  updatedAt?: string;
} 