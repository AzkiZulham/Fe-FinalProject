export type PeakSeason = {
  startDate: string;
  endDate: string;
  nominal?: number | null;
  percentage?: number | null;
  isAvailable?: boolean;
};

export interface RoomType {
  id: number;
  roomName: string;
  price: number;
  description: string;
  images: string[];
  peakSeasons: PeakSeason[];
  capacity?: number;
  quota?: number;
  adultQty?: number;
  childQty?: number;
  roomImg?: string;
}

export interface Property {
  id: number;
  name: string;
  address: string;
  description?: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  images: string[];
  roomtypes: RoomType[];
  picture?: string;
  city?: string;
}

export interface Review {
  id: number;
  userName: string;
  rating: number;
  date: string; 
  comment?: string;
  likes?: number;
  verified?: boolean;
}
