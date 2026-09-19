// ==========================================================
// SMARTTRIP - REPOSITÓRIO FIRESTORE DE PERFIL E PREFERÊNCIAS
// Caminho: /users/{userId}
// Segurança: Zero-Trust Client - Nunca confia em dados não autenticados
// ==========================================================

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { isFirebaseConfigured } from '../config';
import { getFirebaseFirestore } from '../client';
import { AuthUserProfile, mockAuthService } from '../auth';
import { mockStore, UserPreferences } from '../../../data/mockStore';

export const VALID_STYLES = [
  'Gastronomia',
  'Cultura',
  'Caminhadas Urbanas',
  'Natureza & Trilhas',
  'Praia & Mar',
  'Relaxamento & Spa',
  'Vida Noturna',
  'História',
  'Compras',
] as const;

export const VALID_BUDGETS = ['economico', 'moderado', 'luxo'] as const;
export const VALID_PACES = ['tranquilo', 'moderado', 'intenso'] as const;
export const VALID_TRANSPORTS = [
  'caminhada',
  'transporte_publico',
  'carro_aplicativo',
  'bicicleta',
] as const;
export const VALID_WEATHER = [
  'calor_sol',
  'ameno_primavera',
  'frio_inverno',
  'indiferente',
] as const;

/**
 * Validação semântica e estrutural das Preferências de Viagem
 */
export function validatePreferences(preferences: UserPreferences): void {
  if (!preferences) {
    throw new Error('O objeto de preferências não foi informado.');
  }

  // 1. Estilos (interesses)
  if (
    !preferences.styles ||
    !Array.isArray(preferences.styles) ||
    preferences.styles.length === 0
  ) {
    throw new Error('Selecione ao menos um estilo de viagem favorito (CA-PREF-001).');
  }

  // 2. Modais de transporte
  if (
    !preferences.transportation ||
    !Array.isArray(preferences.transportation) ||
    preferences.transportation.length === 0
  ) {
    throw new Error('Selecione ao menos um meio de transporte prioritário.');
  }

  // 3. Orçamento
  if (!VALID_BUDGETS.includes(preferences.budget as any)) {
    throw new Error('Faixa de orçamento inválida.');
  }

  // 4. Ritmo
  if (!VALID_PACES.includes(preferences.pace as any)) {
    throw new Error('Ritmo de viagem inválido.');
  }

  // 5. Clima preferido
  if (!VALID_WEATHER.includes(preferences.preferredWeather as any)) {
    throw new Error('Preferência de clima inválida.');
  }

  // 6. Raio de deslocamento máximo (km)
  if (
    typeof preferences.maxDistanceKm !== 'number' ||
    isNaN(preferences.maxDistanceKm) ||
    preferences.maxDistanceKm < 2 ||
    preferences.maxDistanceKm > 300
  ) {
    throw new Error('O raio de deslocamento diário deve estar entre 2 km e 300 km (CA-PREF-003).');
  }
}

class UserRepository {
  private memoryProfiles: Map<string, AuthUserProfile> = new Map();

  constructor() {
    this.seedInitial();
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('smarttrip_user_profiles_repo');
        if (stored) {
          const list: AuthUserProfile[] = JSON.parse(stored);
          list.forEach((item) => this.memoryProfiles.set(item.uid, item));
        }
      } catch (e) {
        console.warn('Falha ao restaurar perfis de usuário:', e);
      }
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const list = Array.from(this.memoryProfiles.values());
        localStorage.setItem('smarttrip_user_profiles_repo', JSON.stringify(list));
      } catch (e) {
        console.warn('Falha ao gravar perfis de usuário no storage:', e);
      }
    }
  }

  private seedInitial() {
    const larissa: AuthUserProfile = {
      uid: 'usr_larissa_001',
      email: 'larissa.mendes@email.com',
      displayName: 'Larissa Mendes',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
      homeCity: 'São Paulo, SP',
      role: 'user',
      preferences: {
        styles: ['Gastronomia', 'Cultura', 'Caminhadas Urbanas'],
        pace: 'moderado',
        budget: 'moderado',
        transportation: ['caminhada', 'transporte_publico'],
        preferredWeather: 'ameno_primavera',
        maxDistanceKm: 15,
      },
    };
    this.memoryProfiles.set(larissa.uid, larissa);
  }

  /**
   * Recupera o perfil completo do usuário
   */
  async getUserProfile(userId: string): Promise<AuthUserProfile | null> {
    if (!userId) return null;

    if (!isFirebaseConfigured()) {
      return this.memoryProfiles.get(userId) || null;
    }

    const db = getFirebaseFirestore();
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return null;
    }

    return snap.data() as AuthUserProfile;
  }

  /**
   * Atualização atômica das preferências de viagem
   * SEGURANÇA: Não confia em userId fornecido fora da sessão autenticada.
   */
  async updatePreferences(
    sessionUserId: string,
    targetUserId: string,
    preferences: UserPreferences
  ): Promise<UserPreferences> {
    if (!sessionUserId || !sessionUserId.trim()) {
      throw new Error('[Security Violation] Usuário não autenticado.');
    }

    // Validação estrita: Usuário só altera suas próprias preferências
    if (sessionUserId !== targetUserId) {
      throw new Error('[Security Violation] Acesso negado: operação não autorizada em perfil alheio.');
    }

    validatePreferences(preferences);

    if (!isFirebaseConfigured()) {
      const existing = this.memoryProfiles.get(targetUserId);
      if (existing) {
        existing.preferences = { ...preferences };
        this.memoryProfiles.set(targetUserId, existing);
        this.saveToLocalStorage();
      }

      // Sincroniza mockStore e mockAuthService
      mockStore.updateUser({ preferences });
      return preferences;
    }

    const db = getFirebaseFirestore();
    const userRef = doc(db, 'users', targetUserId);

    await updateDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp(),
    });

    mockStore.updateUser({ preferences });
    return preferences;
  }

  /**
   * Atualização cadastral de dados do perfil (nome, cidade base)
   */
  async updateProfileData(
    sessionUserId: string,
    targetUserId: string,
    data: { displayName?: string; homeCity?: string; photoURL?: string }
  ): Promise<AuthUserProfile> {
    if (!sessionUserId || sessionUserId !== targetUserId) {
      throw new Error('[Security Violation] Acesso negado: operação não autorizada em perfil alheio.');
    }

    if (!isFirebaseConfigured()) {
      let current = this.memoryProfiles.get(targetUserId);
      if (!current) {
        current = {
          uid: targetUserId,
          email: 'usuario@smarttrip.com',
          displayName: data.displayName || 'Viajante',
          photoURL: data.photoURL || null,
          homeCity: data.homeCity || 'São Paulo, SP',
          role: 'user',
          preferences: {
            styles: ['Gastronomia', 'Cultura'],
            pace: 'moderado',
            budget: 'moderado',
            transportation: ['caminhada', 'transporte_publico'],
            preferredWeather: 'ameno_primavera',
            maxDistanceKm: 15,
          },
        };
      } else {
        if (data.displayName !== undefined) current.displayName = data.displayName;
        if (data.homeCity !== undefined) current.homeCity = data.homeCity;
        if (data.photoURL !== undefined) current.photoURL = data.photoURL;
      }
      this.memoryProfiles.set(targetUserId, current);
      this.saveToLocalStorage();
      mockStore.updateUser({
        name: current.displayName,
        homeCity: current.homeCity,
      });
      return current;
    }

    const db = getFirebaseFirestore();
    const userRef = doc(db, 'users', targetUserId);

    const updates: any = {
      updatedAt: serverTimestamp(),
    };
    if (data.displayName !== undefined) updates.displayName = data.displayName;
    if (data.homeCity !== undefined) updates.homeCity = data.homeCity;
    if (data.photoURL !== undefined) updates.photoURL = data.photoURL;

    await updateDoc(userRef, updates);
    const updatedSnap = await getDoc(userRef);
    const updated = updatedSnap.data() as AuthUserProfile;

    mockStore.updateUser({
      name: updated.displayName,
      homeCity: updated.homeCity,
    });
    return updated;
  }

  resetForTests() {
    this.memoryProfiles.clear();
    this.seedInitial();
  }
}

export const userRepository = new UserRepository();
