// ==========================================================
// SMARTTRIP - REPOSITÓRIO FIRESTORE DE VIAGENS (TRIPS)
// Encapsula queries, ownership, serverTimestamp e mutações.
// Regra: UI nunca faz queries diretas nem filtros em memória no cliente.
// ==========================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { isFirebaseConfigured } from '../config';
import { getFirebaseFirestore } from '../client';
import { Trip, Activity, DayPlan, UserPreferences } from '../../../data/mockStore';

export interface CreateTripDTO {
  title: string;
  destination: string;
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: 'draft' | 'saved';
  preferencesSnapshot: UserPreferences;
  weatherSummary: {
    avgTemp: number;
    hasRainRisk: boolean;
    mainCondition: string;
  };
  itinerary: DayPlan[];
}

// ----------------------------------------------------------------------
// VALIDAÇÃO DE DADOS E LIMITES (RN-001)
// ----------------------------------------------------------------------

export function validateTripData(data: Partial<CreateTripDTO>) {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error('O título da viagem é obrigatório.');
  }
  if (!data.destination || data.destination.trim().length === 0) {
    throw new Error('A cidade de destino é obrigatória.');
  }
  if (!data.startDate || !data.endDate) {
    throw new Error('As datas de início e término são obrigatórias.');
  }

  if (typeof data.durationDays === 'number') {
    if (data.durationDays < 1 || data.durationDays > 15) {
      throw new Error(
        `Duração da viagem inválida (${data.durationDays} dias). O SmartTrip MVP suporta viagens de 1 a 15 dias (RN-001).`
      );
    }
  }
}

// ----------------------------------------------------------------------
// IMPLEMENTAÇÃO DO REPOSITÓRIO (PRODUÇÃO & TESTES)
// ----------------------------------------------------------------------

class TripsRepository {
  // Store em memória para testes e execução local sem chaves ativas
  private memoryTrips: Map<string, Trip> = new Map();

  constructor() {
    this.seedInitialTrips();
  }

  private seedInitialTrips() {
    const initialTrip: Trip = {
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
        mainCondition: 'Parcialmente Nublado com chuva no dia 2',
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
              title: 'Caminhada pela Ciudad Vieja',
              description: 'Exploração dos monumentos históricos centrais.',
              category: 'cultural',
              estimatedCost: 'gratis',
              weatherTip: 'Manhã clara e ensolarada.',
            },
          ],
        },
      ],
    };

    this.memoryTrips.set(initialTrip.id, initialTrip);
  }

  /**
   * Cria uma nova viagem vinculada ao proprietário autenticado.
   * Injeta serverTimestamp e validação de limites (1 a 15 dias).
   */
  async createTrip(userId: string, tripData: CreateTripDTO): Promise<Trip> {
    if (!userId) {
      throw new Error('[Security Violation] Usuário não autenticado não pode criar viagens.');
    }

    validateTripData(tripData);

    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (!isFirebaseConfigured()) {
      const newTrip: Trip = {
        id: tripId,
        userId,
        ...tripData,
      };
      this.memoryTrips.set(tripId, newTrip);
      return newTrip;
    }

    const db = getFirebaseFirestore();
    const tripRef = doc(db, 'trips', tripId);

    const payload = {
      id: tripId,
      userId,
      ...tripData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(tripRef, payload);

    return {
      id: tripId,
      userId,
      ...tripData,
    };
  }

  /**
   * Busca viagem por ID garantindo validação estrita de ownership.
   */
  async getTripById(tripId: string, requestUserId: string): Promise<Trip> {
    if (!requestUserId) {
      throw new Error('[Security Error] Usuário não autenticado.');
    }

    if (!isFirebaseConfigured()) {
      const trip = this.memoryTrips.get(tripId);
      if (!trip) {
        throw new Error(`Viagem com ID "${tripId}" não encontrada.`);
      }
      if (trip.userId !== requestUserId) {
        throw new Error('[Security Violation] Acesso negado: você não é o proprietário desta viagem.');
      }
      return trip;
    }

    const db = getFirebaseFirestore();
    const tripRef = doc(db, 'trips', tripId);
    const snap = await getDoc(tripRef);

    if (!snap.exists()) {
      throw new Error(`Viagem com ID "${tripId}" não encontrada.`);
    }

    const data = snap.data() as Trip;
    if (data.userId !== requestUserId) {
      throw new Error('[Security Violation] Acesso negado: você não é o proprietário desta viagem.');
    }

    return data;
  }

  /**
   * Lista as viagens do usuário utilizando consulta indexada no banco.
   * Regra NoSQL: NUNCA baixa todos os documentos do banco para filtrar no cliente.
   */
  async listUserTrips(userId: string, statusFilter?: 'all' | 'saved' | 'draft'): Promise<Trip[]> {
    if (!userId) return [];

    if (!isFirebaseConfigured()) {
      const results: Trip[] = [];
      for (const trip of this.memoryTrips.values()) {
        if (trip.userId === userId) {
          if (!statusFilter || statusFilter === 'all' || trip.status === statusFilter) {
            results.push(trip);
          }
        }
      }
      return results.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
    }

    const db = getFirebaseFirestore();
    const tripsCol = collection(db, 'trips');

    // Query indexada: filtra no Firestore pelo userId
    let q = query(tripsCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));

    if (statusFilter && statusFilter !== 'all') {
      q = query(
        tripsCol,
        where('userId', '==', userId),
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => docSnap.data() as Trip);
  }

  /**
   * Atualiza a viagem validando ownership e proibindo transferência de userId.
   */
  async updateTrip(tripId: string, requestUserId: string, updates: Partial<Trip>): Promise<void> {
    const existing = await this.getTripById(tripId, requestUserId);

    if (updates.userId && updates.userId !== existing.userId) {
      throw new Error('[Security Violation] É proibido transferir a propriedade de uma viagem para outro usuário.');
    }

    if (updates.durationDays) {
      validateTripData({ durationDays: updates.durationDays });
    }

    if (!isFirebaseConfigured()) {
      this.memoryTrips.set(tripId, {
        ...existing,
        ...updates,
        userId: existing.userId, // Garante que o userId original nunca mude
      });
      return;
    }

    const db = getFirebaseFirestore();
    const tripRef = doc(db, 'trips', tripId);

    const safeUpdates = {
      ...updates,
      userId: existing.userId,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(tripRef, safeUpdates);
  }

  /**
   * Exclui fisicamente a viagem garantindo que somente o proprietário possa executá-la.
   */
  async deleteTrip(tripId: string, requestUserId: string): Promise<void> {
    await this.getTripById(tripId, requestUserId); // Valida existência e ownership

    if (!isFirebaseConfigured()) {
      this.memoryTrips.delete(tripId);
      return;
    }

    const db = getFirebaseFirestore();
    await deleteDoc(doc(db, 'trips', tripId));
  }

  // --------------------------------------------------------------------
  // OPERAÇÕES EM ATIVIDADES DO ITINERÁRIO (EMBEDDED NO DOCUMENTO)
  // --------------------------------------------------------------------

  async updateTripActivity(
    tripId: string,
    requestUserId: string,
    dayIndex: number,
    activityId: string,
    activityUpdates: Partial<Activity>
  ): Promise<void> {
    const trip = await this.getTripById(tripId, requestUserId);

    const updatedItinerary = trip.itinerary.map((day: DayPlan) => {
      if (day.dayIndex !== dayIndex) return day;
      return {
        ...day,
        activities: day.activities.map((act: Activity) =>
          act.id === activityId ? { ...act, ...activityUpdates } : act
        ),
      };
    });

    await this.updateTrip(tripId, requestUserId, { itinerary: updatedItinerary });
  }

  async deleteTripActivity(
    tripId: string,
    requestUserId: string,
    dayIndex: number,
    activityId: string
  ): Promise<void> {
    const trip = await this.getTripById(tripId, requestUserId);

    const updatedItinerary = trip.itinerary.map((day: DayPlan) => {
      if (day.dayIndex !== dayIndex) return day;
      return {
        ...day,
        activities: day.activities.filter((act: Activity) => act.id !== activityId),
      };
    });

    await this.updateTrip(tripId, requestUserId, { itinerary: updatedItinerary });
  }

  async addTripActivity(
    tripId: string,
    requestUserId: string,
    dayIndex: number,
    newActivity: Activity
  ): Promise<void> {
    const trip = await this.getTripById(tripId, requestUserId);

    const updatedItinerary = trip.itinerary.map((day: DayPlan) => {
      if (day.dayIndex !== dayIndex) return day;
      return {
        ...day,
        activities: [...day.activities, newActivity],
      };
    });

    await this.updateTrip(tripId, requestUserId, { itinerary: updatedItinerary });
  }

  resetForTests() {
    this.memoryTrips.clear();
    this.seedInitialTrips();
  }
}

export const tripsRepository = new TripsRepository();
