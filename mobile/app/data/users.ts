export interface User {
  id: string;
  name: string;
  avatar: string;
  location: string;
  restaurants: string[];
  favorites: string[];
  followers: number;
  following: number;
}

export const currentUser: User = {
  id: "user1",
  name: "John Doe",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop",
  location: "San Francisco, CA",
  restaurants: ["1", "2", "3"],
  favorites: ["4", "5", "6"],
  followers: 1234,
  following: 567
};

export const sampleUsers: User[] = [
  {
    id: "user2",
    name: "Jane Smith",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop",
    location: "New York, NY",
    restaurants: ["4", "5"],
    favorites: ["1", "2"],
    followers: 890,
    following: 234
  },
  {
    id: "user3",
    name: "Mike Johnson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
    location: "Los Angeles, CA",
    restaurants: ["6", "7"],
    favorites: ["3", "4"],
    followers: 567,
    following: 123
  }
]; 