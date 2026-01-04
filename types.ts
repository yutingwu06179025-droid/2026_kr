
export type ItemStatus = 'FIXED' | 'DRAFT' | 'EMPTY';
export type ItemType = 'ACTIVITY' | 'FLIGHT';

export interface ItineraryItem {
  id: string;
  time: string;
  endTime?: string;
  activity: string;
  location: string;
  status: ItemStatus;
  type?: ItemType;
  origin?: string;
  destination?: string;
  description?: string;
  note?: string;
  naverUrl?: string;
}

export interface DayPlan {
  date: string;
  weather?: string;
  temp?: string;
  locationName?: string;
  items: ItineraryItem[];
}

export interface Voucher {
  id: string;
  title: string;
  type: string;
  date?: string;
  status: string;
  note?: string;
  fileData?: string;
  link?: string;
  mapUrl?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: 'WANT' | 'BUY';
  location?: string;
  price?: string;
  isCompleted: boolean;
  imageUrl?: string;
  link?: string;
  mapUrl?: string;
}

// Added missing interfaces for Gemini service
export interface TripContext {
  destination: string;
  preferences: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}
