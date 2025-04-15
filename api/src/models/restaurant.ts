export interface Restaurant {
    id: string;
    name: string;
    image: string[];
    rating: number;
    time: string;
    price: string;
    location: string;
    description: string;
    category: string;
    isHighlighted?: boolean;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    operatingHours?: {
      [key: string]: {
        open: string;
        close: string;
      };
    };
    contact?: {
      phone: string;
      email: string;
      website?: string;
    };
    features?: string[];
    menu?: {
      categories: {
        name: string;
        items: {
          id: string;
          name: string;
          description: string;
          price: number;
          image?: string;
        }[];
      }[];
    };
  }
  