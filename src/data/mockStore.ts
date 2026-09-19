// ==========================================================
// SMARTTRIP - MÓDULO CENTRAL DE DADOS E ESTADO MOCK (STORE)
// Centraliza todos os dados e mutações temporárias do MVP.
// ==========================================================

export type TravelBudget = 'economico' | 'moderado' | 'luxo';
export type TravelPace = 'tranquilo' | 'moderado' | 'intenso';
export type WeatherPreference = 'calor_sol' | 'ameno_primavera' | 'frio_inverno' | 'indiferente';
export type TransportMode = 'caminhada' | 'transporte_publico' | 'carro_aplicativo' | 'bicicleta';

export interface UserPreferences {
  styles: string[];
  budget: TravelBudget;
  pace: TravelPace;
  transportation: TransportMode[];
  preferredWeather: WeatherPreference;
  maxDistanceKm: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  homeCity: string;
  preferences: UserPreferences;
}

export interface AvailabilityPeriod {
  id: string;
  userId?: string;
  title: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Activity {
  id: string;
  period: 'morning' | 'afternoon' | 'evening';
  time: string;
  title: string;
  description: string;
  category: 'cultural' | 'gastronomia' | 'natureza' | 'lazer';
  estimatedCost: 'gratis' | '$' | '$$' | '$$$';
  weatherTip: string;
  isCustom?: boolean;
}

export interface DayPlan {
  dayIndex: number;
  date: string;
  weather: {
    tempMin: number;
    tempMax: number;
    rainProbability: number;
    condition: 'Ensolarado' | 'Parcialmente Nublado' | 'Chuvoso' | 'Tempestade';
  };
  activities: Activity[];
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: 'draft' | 'saved' | 'archived';
  preferencesSnapshot: UserPreferences;
  weatherSummary: {
    avgTemp: number;
    hasRainRisk: boolean;
    mainCondition: string;
  };
  itinerary: DayPlan[];
}

export interface DestinationSuggestion {
  id: string;
  name: string;
  country: string;
  tagline: string;
  coverImage: string;
  coordinates: { lat: number; lng: number };
  sampleWeather: {
    temp: number;
    condition: string;
    rainProb: number;
  };
}

// ----------------------------------------------------------------------
// DADOS MOCK INICIAIS
// ----------------------------------------------------------------------

export const MOCK_USER: UserProfile = {
  id: 'usr_larissa_001',
  name: 'Larissa Mendes',
  email: 'larissa.mendes@email.com',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  homeCity: 'São Paulo, SP',
  preferences: {
    styles: ['Gastronomia', 'Cultura', 'Caminhadas Urbanas'],
    pace: 'moderado',
    budget: 'moderado',
    transportation: ['caminhada', 'transporte_publico'],
    preferredWeather: 'ameno_primavera',
    maxDistanceKm: 15,
  },
};

export const MOCK_AVAILABILITIES: AvailabilityPeriod[] = [
  {
    id: 'av_001',
    userId: 'usr_larissa_001',
    title: 'Feriado Tiradentes Prolongado',
    startDate: '2026-04-21',
    endDate: '2026-04-24',
    durationDays: 4,
    notes: 'Quero aproveitar para conhecer novos restaurantes e museus.',
  },
  {
    id: 'av_002',
    userId: 'usr_larissa_001',
    title: 'Férias de Primavera',
    startDate: '2026-10-10',
    endDate: '2026-10-16',
    durationDays: 7,
    notes: 'Viagem de descanso com foco em caminhadas leves.',
  },
  {
    id: 'av_003',
    userId: 'usr_larissa_001',
    title: 'Fim de Semana Especial',
    startDate: '2026-11-14',
    endDate: '2026-11-15',
    durationDays: 2,
    notes: 'Bate-volta rápido na serra.',
  },
];

export const MOCK_DESTINATIONS: DestinationSuggestion[] = [
  {
    id: 'dest_01',
    name: 'Montevidéu',
    country: 'Uruguai',
    tagline: 'Cafés históricos, rambla serena e parrillas autênticas.',
    coverImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&fit=crop',
    coordinates: { lat: -34.9011, lng: -56.1645 },
    sampleWeather: { temp: 20, condition: 'Parcialmente Nublado', rainProb: 25 },
  },
  {
    id: 'dest_02',
    name: 'Buenos Aires',
    country: 'Argentina',
    tagline: 'Livrarias icônicas, arte cosmopolita e gastronomia sofisticada.',
    coverImage: 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=800&fit=crop',
    coordinates: { lat: -34.6037, lng: -58.3816 },
    sampleWeather: { temp: 23, condition: 'Ensolarado', rainProb: 10 },
  },
  {
    id: 'dest_03',
    name: 'Paraty',
    country: 'Brasil',
    tagline: 'Casario colonial, cachoeiras na Mata Atlântica e passeios de escuna.',
    coverImage: 'https://images.unsplash.com/photo-1599827552599-eadf5fb3c75f?w=800&fit=crop',
    coordinates: { lat: -23.2203, lng: -44.7176 },
    sampleWeather: { temp: 27, condition: 'Chuvoso', rainProb: 65 },
  },
  {
    id: 'dest_04',
    name: 'Gramado & Canela',
    country: 'Brasil',
    tagline: 'Clima serrano, arquitetura bávara e chocolates artesanais.',
    coverImage: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&fit=crop',
    coordinates: { lat: -29.3746, lng: -50.8764 },
    sampleWeather: { temp: 15, condition: 'Parcialmente Nublado', rainProb: 30 },
  },
];

export const MOCK_TRIPS: Trip[] = [
  {
    id: 'trip_mvd_2026',
    userId: 'usr_larissa_001',
    title: 'Escapada Cultural em Montevidéu',
    destination: 'Montevidéu',
    country: 'Uruguai',
    coverImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1000&fit=crop',
    startDate: '2026-10-10',
    endDate: '2026-10-13',
    durationDays: 4,
    status: 'saved',
    preferencesSnapshot: {
      styles: ['Gastronomia', 'Cultura'],
      pace: 'moderado',
      budget: 'moderado',
      transportation: ['caminhada', 'transporte_publico'],
      preferredWeather: 'ameno_primavera',
      maxDistanceKm: 15,
    },
    weatherSummary: {
      avgTemp: 19,
      hasRainRisk: true,
      mainCondition: 'Parcialmente Nublado com chuva leve no dia 2',
    },
    itinerary: [
      {
        dayIndex: 1,
        date: '2026-10-10',
        weather: {
          tempMin: 14,
          tempMax: 22,
          rainProbability: 15,
          condition: 'Ensolarado',
        },
        activities: [
          {
            id: 'act_101',
            period: 'morning',
            time: '09:30',
            title: 'Caminhada pela Ciudad Vieja e Puerta de la Ciudadela',
            description: 'Exploração a pé dos monumentos históricos centrais e praça Independência.',
            category: 'cultural',
            estimatedCost: 'gratis',
            weatherTip: 'Manhã clara e ensolarada, ideal para fotografias ao ar livre.',
          },
          {
            id: 'act_102',
            period: 'afternoon',
            time: '13:00',
            title: 'Almoço no Mercado del Puerto',
            description: 'Degustação de parrilla tradicional uruguaia e meio-e-meio no coração do porto.',
            category: 'gastronomia',
            estimatedCost: '$$$',
            weatherTip: 'Ambiente parcialmente coberto com clima agradável.',
          },
          {
            id: 'act_103',
            period: 'evening',
            time: '18:00',
            title: 'Pôr do Sol na Rambla de Pocitos',
            description: 'Caminhada descontraída à beira do Rio da Prata apreciando o entardecer.',
            category: 'lazer',
            estimatedCost: 'gratis',
            weatherTip: 'Brisa marinha refrescante; leve um casaco leve.',
          },
        ],
      },
      {
        dayIndex: 2,
        date: '2026-10-11',
        weather: {
          tempMin: 15,
          tempMax: 18,
          rainProbability: 75,
          condition: 'Chuvoso',
        },
        activities: [
          {
            id: 'act_201',
            period: 'morning',
            time: '10:00',
            title: 'Visita Guiada ao Teatro Solís e Museu de Artes Visuais',
            description: 'Tour cultural interno protegido da chuva com arquitetura neoclássica espetacular.',
            category: 'cultural',
            estimatedCost: '$$',
            weatherTip: '⚠️ Chuva matinal prevista: atividade indoor recomendada pela IA.',
          },
          {
            id: 'act_202',
            period: 'afternoon',
            time: '14:30',
            title: 'Tarde no Café Brasilero com Torta de Doce de Leite',
            description: 'Pausa aconchegante no café mais antigo de Montevidéu, fundado em 1877.',
            category: 'gastronomia',
            estimatedCost: '$$',
            weatherTip: 'Refúgio perfeito contra os chuviscos da tarde.',
          },
          {
            id: 'act_203',
            period: 'evening',
            time: '20:30',
            title: 'Espetáculo de Candombe e Jantar Típico no Bairro Sur',
            description: 'Imersão nos ritmos afro-uruguaios com culinária autêntica.',
            category: 'cultural',
            estimatedCost: '$$',
            weatherTip: 'Ambiente interno aquecido.',
          },
        ],
      },
      {
        dayIndex: 3,
        date: '2026-10-12',
        weather: {
          tempMin: 13,
          tempMax: 20,
          rainProbability: 20,
          condition: 'Parcialmente Nublado',
        },
        activities: [
          {
            id: 'act_301',
            period: 'morning',
            time: '10:00',
            title: 'Feira de Tristán Narvaja (Feira de Antiguidades)',
            description: 'Tradicional feira dominical de rua com livros raros, antiguidades e artesanato.',
            category: 'cultural',
            estimatedCost: 'gratis',
            weatherTip: 'Clima estável com nuvens amenas.',
          },
          {
            id: 'act_302',
            period: 'afternoon',
            time: '15:00',
            title: 'Tour na Vinícola Bouza com Degustação de Tannat',
            description: 'Visita aos vinhedos boutique nos arredores da cidade com harmonização de queijos.',
            category: 'gastronomia',
            estimatedCost: '$$$',
            weatherTip: 'Tempo propício para fotos nas vinhas.',
          },
        ],
      },
    ],
  },
  {
    id: 'trip_pty_2026',
    userId: 'usr_larissa_001',
    title: 'Fim de Semana Histórico em Paraty',
    destination: 'Paraty',
    country: 'Brasil',
    coverImage: 'https://images.unsplash.com/photo-1599827552599-eadf5fb3c75f?w=1000&fit=crop',
    startDate: '2026-04-21',
    endDate: '2026-04-24',
    durationDays: 4,
    status: 'saved',
    preferencesSnapshot: {
      styles: ['Natureza & Trilhas', 'Cultura'],
      pace: 'tranquilo',
      budget: 'economico',
      transportation: ['caminhada', 'bicicleta'],
      preferredWeather: 'calor_sol',
      maxDistanceKm: 10,
    },
    weatherSummary: {
      avgTemp: 26,
      hasRainRisk: false,
      mainCondition: 'Ensolarado',
    },
    itinerary: [],
  },
];

// ----------------------------------------------------------------------
// STORE REATIVO EM MEMÓRIA (SINGLETON COM LISTENERS)
// ----------------------------------------------------------------------

type Listener = () => void;

class MockDataStore {
  private user: UserProfile = { ...MOCK_USER };
  private trips: Trip[] = [...MOCK_TRIPS];
  private availabilities: AvailabilityPeriod[] = [...MOCK_AVAILABILITIES];
  private listeners: Set<Listener> = new Set();
  private isAuthenticated: boolean = true; // Permite alternar estado no protótipo

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedUser = localStorage.getItem('smarttrip_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          this.user = {
            ...this.user,
            ...parsed,
            preferences: {
              ...this.user.preferences,
              ...(parsed.preferences || {}),
            },
          };
        }
        const savedAvail = localStorage.getItem('smarttrip_availabilities');
        if (savedAvail) {
          this.availabilities = JSON.parse(savedAvail);
        }
      } catch (e) {
        console.warn('Falha ao restaurar dados do localStorage:', e);
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('smarttrip_user', JSON.stringify(this.user));
        localStorage.setItem('smarttrip_availabilities', JSON.stringify(this.availabilities));
      } catch (e) {
        console.warn('Falha ao gravar dados no localStorage:', e);
      }
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Auth
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  setLoggedIn(state: boolean) {
    this.isAuthenticated = state;
    this.notify();
  }

  // User
  getUser(): UserProfile {
    return this.user;
  }

  updateUser(updated: Partial<UserProfile>) {
    this.user = {
      ...this.user,
      ...updated,
      preferences: {
        ...this.user.preferences,
        ...(updated.preferences || {}),
      },
    };
    this.saveToStorage();
    this.notify();
  }

  // Trips
  getTrips(): Trip[] {
    return this.trips;
  }

  getTripById(id: string): Trip | undefined {
    return this.trips.find((t) => t.id === id);
  }

  createTrip(newTrip: Trip) {
    this.trips = [newTrip, ...this.trips];
    this.notify();
  }

  updateTrip(tripId: string, updated: Partial<Trip>) {
    this.trips = this.trips.map((t) => (t.id === tripId ? { ...t, ...updated } : t));
    this.notify();
  }

  deleteTrip(tripId: string) {
    this.trips = this.trips.filter((t) => t.id !== tripId);
    this.notify();
  }

  // Activities
  updateActivity(tripId: string, dayIndex: number, activityId: string, updated: Partial<Activity>) {
    this.trips = this.trips.map((trip) => {
      if (trip.id !== tripId) return trip;
      const newItinerary = trip.itinerary.map((day) => {
        if (day.dayIndex !== dayIndex) return day;
        return {
          ...day,
          activities: day.activities.map((act) => (act.id === activityId ? { ...act, ...updated } : act)),
        };
      });
      return { ...trip, itinerary: newItinerary };
    });
    this.notify();
  }

  deleteActivity(tripId: string, dayIndex: number, activityId: string) {
    this.trips = this.trips.map((trip) => {
      if (trip.id !== tripId) return trip;
      const newItinerary = trip.itinerary.map((day) => {
        if (day.dayIndex !== dayIndex) return day;
        return {
          ...day,
          activities: day.activities.filter((act) => act.id !== activityId),
        };
      });
      return { ...trip, itinerary: newItinerary };
    });
    this.notify();
  }

  addActivity(tripId: string, dayIndex: number, newAct: Activity) {
    this.trips = this.trips.map((trip) => {
      if (trip.id !== tripId) return trip;
      const newItinerary = trip.itinerary.map((day) => {
        if (day.dayIndex !== dayIndex) return day;
        return {
          ...day,
          activities: [...day.activities, newAct],
        };
      });
      return { ...trip, itinerary: newItinerary };
    });
    this.notify();
  }

  // Availabilities
  getAvailabilities(): AvailabilityPeriod[] {
    return this.availabilities;
  }

  addAvailability(item: AvailabilityPeriod) {
    this.availabilities = [item, ...this.availabilities];
    this.saveToStorage();
    this.notify();
  }

  updateAvailability(id: string, updated: Partial<AvailabilityPeriod>) {
    this.availabilities = this.availabilities.map((a) => (a.id === id ? { ...a, ...updated } : a));
    this.saveToStorage();
    this.notify();
  }

  deleteAvailability(id: string) {
    this.availabilities = this.availabilities.filter((a) => a.id !== id);
    this.saveToStorage();
    this.notify();
  }

  // Reset para demonstração
  resetToInitial() {
    this.user = { ...MOCK_USER };
    this.trips = [...MOCK_TRIPS];
    this.availabilities = [...MOCK_AVAILABILITIES];
    this.isAuthenticated = true;
    this.saveToStorage();
    this.notify();
  }
}

export const mockStore = new MockDataStore();
