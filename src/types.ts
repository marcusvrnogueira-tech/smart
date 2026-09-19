export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  category: 'culture' | 'food' | 'nature' | 'relax' | 'transport' | 'nightlife';
  location: string;
  cost: number;
  duration: string;
  imageUrl: string;
  directImageLink: string;
  notes?: string;
  rating?: number;
  isConfirmed?: boolean;
  bookingCode?: string;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  title: string;
  note: string;
  weather: {
    temp: string;
    condition: string;
    rainProb: string;
    icon: string;
  };
  items: ItineraryItem[];
}

export interface BudgetItem {
  id: string;
  category: 'accommodation' | 'transport' | 'food' | 'activities' | 'shopping';
  name: string;
  amount: number;
  paid: boolean;
  date: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  country: string;
  flag: string;
  coverImageUrl: string;
  directImageLink: string;
  dateRange: string;
  daysCount: number;
  budgetTotal: number;
  budgetSpent: number;
  currency: string;
  status: 'active' | 'upcoming' | 'completed';
  rating: number;
  tags: string[];
  weatherSummary: {
    temp: string;
    condition: string;
    icon: string;
  };
  days: DayPlan[];
  budgetItems: BudgetItem[];
}

export interface WeatherForecastHour {
  hour: string;
  temp: string;
  icon: string;
  condition: string;
  rainChance: string;
}

export interface ImagePreset {
  id: string;
  title: string;
  location: string;
  url: string;
  category: string;
  photographer: string;
}
