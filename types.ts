
export type ItemStatus = 'FIXED' | 'DRAFT' | 'EMPTY';

export interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
  location: string;
  status: ItemStatus;
  description?: string;
  sourceUrl?: string;
  naverUrl?: string;
}

export interface DayPlan {
  date: string;
  items: ItineraryItem[];
}

export interface TripContext {
  destination: string;
  startDate: string;
  duration: number;
  preferences: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}
