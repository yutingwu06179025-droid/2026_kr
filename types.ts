
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

export interface Voucher {
  id: string;
  title: string;
  type: string;
  date?: string;
  status: string;
  note?: string;
}

// Add GroundingSource interface to fix compilation error
export interface GroundingSource {
  title: string;
  uri: string;
}
