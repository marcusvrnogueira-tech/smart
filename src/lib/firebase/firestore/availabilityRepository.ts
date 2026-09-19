// ==========================================================
// SMARTTRIP - REPOSITÓRIO FIRESTORE DE FOLGAS (AVAILABILITIES)
// Subcoleção: /users/{userId}/availabilities/{availabilityId}
// Segurança: Zero-Trust Client - A identidade (userId) vem da sessão
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
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { isFirebaseConfigured } from '../config';
import { getFirebaseFirestore } from '../client';
import { mockStore, AvailabilityPeriod } from '../../../data/mockStore';

export interface CreateAvailabilityDTO {
  title?: string;
  startDate: string;
  endDate: string;
  durationDays?: number;
  notes?: string;
}

export interface UpdateAvailabilityDTO {
  title?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  notes?: string;
}

export interface OverlapResult {
  hasOverlap: boolean;
  conflictingPeriods: AvailabilityPeriod[];
}

/**
 * Calcula a quantidade inclusiva de dias entre duas datas ISO (YYYY-MM-DD)
 */
export function calculateInclusiveDays(startDate: string, endDate: string): number {
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

  const startUtc = Date.UTC(startYear, startMonth - 1, startDay);
  const endUtc = Date.UTC(endYear, endMonth - 1, endDay);

  const diffMs = endUtc - startUtc;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Validação rigorosa de intervalo de datas (CA-AVAIL-001 e CA-AVAIL-002)
 */
export function validateDateRange(startDate?: string, endDate?: string): void {
  if (!startDate || !endDate || !startDate.trim() || !endDate.trim()) {
    throw new Error('As datas de início e término são obrigatórias.');
  }

  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(startDate) || !isoRegex.test(endDate)) {
    throw new Error('Formato de data inválido. Use o padrão AAAA-MM-DD.');
  }

  const [startY, startM, startD] = startDate.split('-').map(Number);
  const [endY, endM, endD] = endDate.split('-').map(Number);

  const startUtc = Date.UTC(startY, startM - 1, startD);
  const endUtc = Date.UTC(endY, endM - 1, endD);

  if (endUtc < startUtc) {
    throw new Error('A data de término não pode ser anterior à data de início.');
  }
}

class AvailabilityRepository {
  private memoryAvailabilities: Map<string, AvailabilityPeriod & { userId: string }> = new Map();

  constructor() {
    this.seedInitial();
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('smarttrip_availabilities_repo');
        if (stored) {
          const list: (AvailabilityPeriod & { userId: string })[] = JSON.parse(stored);
          list.forEach((item) => this.memoryAvailabilities.set(item.id, item));
        }
      } catch (e) {
        console.warn('Falha ao restaurar repositório de folgas:', e);
      }
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const list = Array.from(this.memoryAvailabilities.values());
        localStorage.setItem('smarttrip_availabilities_repo', JSON.stringify(list));
      } catch (e) {
        console.warn('Falha ao gravar folgas no storage:', e);
      }
    }
  }

  private seedInitial() {
    const defaultItem: AvailabilityPeriod & { userId: string } = {
      id: 'av_001',
      userId: 'usr_larissa_001',
      title: 'Feriado Tiradentes Prolongado',
      startDate: '2026-04-21',
      endDate: '2026-04-24',
      durationDays: 4,
      notes: 'Quero aproveitar para conhecer novos restaurantes e museus.',
    };
    this.memoryAvailabilities.set('av_001', defaultItem);
  }

  /**
   * Criação de nova folga
   * REGRA: userId nunca é recebido do formulário, sempre da identidade de sessão.
   */
  async createAvailability(
    userId: string,
    data: CreateAvailabilityDTO
  ): Promise<AvailabilityPeriod> {
    if (!userId || !userId.trim()) {
      throw new Error('[Security Violation] Usuário não autenticado.');
    }

    validateDateRange(data.startDate, data.endDate);

    const calculatedDays = calculateInclusiveDays(data.startDate, data.endDate);
    const id = `av_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const period: AvailabilityPeriod = {
      id,
      userId,
      title: data.title?.trim() || `Folga de ${calculatedDays} dias`,
      startDate: data.startDate,
      endDate: data.endDate,
      durationDays: calculatedDays,
      notes: data.notes?.trim() || '',
    };

    if (!isFirebaseConfigured()) {
      this.memoryAvailabilities.set(id, { ...period, userId });
      this.saveToLocalStorage();
      mockStore.addAvailability(period);
      return period;
    }

    const db = getFirebaseFirestore();
    const docRef = doc(db, 'users', userId, 'availabilities', id);

    await setDoc(docRef, {
      ...period,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    mockStore.addAvailability(period);
    return period;
  }

  /**
   * Consulta períodos de folga de um usuário ordenados cronologicamente
   */
  async listUserAvailabilities(userId: string): Promise<AvailabilityPeriod[]> {
    if (!userId) return [];

    if (!isFirebaseConfigured()) {
      const results: AvailabilityPeriod[] = [];
      for (const item of this.memoryAvailabilities.values()) {
        if (item.userId === userId) {
          results.push({
            id: item.id,
            userId: item.userId,
            title: item.title,
            startDate: item.startDate,
            endDate: item.endDate,
            durationDays: item.durationDays,
            notes: item.notes,
          });
        }
      }
      return results.sort((a, b) => a.startDate.localeCompare(b.startDate));
    }

    const db = getFirebaseFirestore();
    const subcol = collection(db, 'users', userId, 'availabilities');
    const q = query(subcol, orderBy('startDate', 'asc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => docSnap.data() as AvailabilityPeriod);
  }

  /**
   * Edição de uma folga existente
   * SEGURANÇA: Validação estrita de ownership (Usuário A não altera registro de Usuário B)
   */
  async updateAvailability(
    userId: string,
    availabilityId: string,
    data: UpdateAvailabilityDTO
  ): Promise<AvailabilityPeriod> {
    if (!userId || !userId.trim()) {
      throw new Error('[Security Violation] Usuário não autenticado.');
    }

    if (!availabilityId) {
      throw new Error('ID do período de folga é obrigatório para atualização.');
    }

    if (!isFirebaseConfigured()) {
      const existing = this.memoryAvailabilities.get(availabilityId);
      if (!existing) {
        throw new Error(`Período de folga com ID "${availabilityId}" não encontrado.`);
      }

      // Validação de segurança de ownership
      if (existing.userId !== userId) {
        throw new Error(
          '[Security Violation] Acesso negado: você não tem permissão para alterar este registro de folga.'
        );
      }

      const newStartDate = data.startDate ?? existing.startDate;
      const newEndDate = data.endDate ?? existing.endDate;
      validateDateRange(newStartDate, newEndDate);

      const durationDays = calculateInclusiveDays(newStartDate, newEndDate);
      const updated: AvailabilityPeriod & { userId: string } = {
        ...existing,
        title: data.title !== undefined ? data.title.trim() : existing.title,
        startDate: newStartDate,
        endDate: newEndDate,
        durationDays,
        notes: data.notes !== undefined ? data.notes.trim() : existing.notes,
        updatedAt: new Date().toISOString(),
      };

      this.memoryAvailabilities.set(availabilityId, updated);
      this.saveToLocalStorage();
      mockStore.updateAvailability(availabilityId, updated);
      return updated;
    }

    const db = getFirebaseFirestore();
    const docRef = doc(db, 'users', userId, 'availabilities', availabilityId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error(`Período de folga com ID "${availabilityId}" não encontrado.`);
    }

    const existing = snap.data() as AvailabilityPeriod;
    if (existing.userId && existing.userId !== userId) {
      throw new Error(
        '[Security Violation] Acesso negado: você não tem permissão para alterar este registro de folga.'
      );
    }

    const newStartDate = data.startDate ?? existing.startDate;
    const newEndDate = data.endDate ?? existing.endDate;
    validateDateRange(newStartDate, newEndDate);

    const durationDays = calculateInclusiveDays(newStartDate, newEndDate);
    const updates: Partial<AvailabilityPeriod> = {
      title: data.title !== undefined ? data.title.trim() : existing.title,
      startDate: newStartDate,
      endDate: newEndDate,
      durationDays,
      notes: data.notes !== undefined ? data.notes.trim() : existing.notes,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updates);
    mockStore.updateAvailability(availabilityId, updates);
    return { ...existing, ...updates };
  }

  /**
   * Exclusão de uma folga
   * SEGURANÇA: Validação de ownership
   */
  async deleteAvailability(userId: string, availabilityId: string): Promise<void> {
    if (!userId || !userId.trim()) {
      throw new Error('[Security Violation] Usuário não autenticado.');
    }

    if (!isFirebaseConfigured()) {
      const item = this.memoryAvailabilities.get(availabilityId);
      if (!item) return;

      // Validação de segurança
      if (item.userId !== userId) {
        throw new Error(
          '[Security Violation] Acesso negado: você não tem permissão para excluir este registro de folga.'
        );
      }

      this.memoryAvailabilities.delete(availabilityId);
      this.saveToLocalStorage();
      mockStore.deleteAvailability(availabilityId);
      return;
    }

    const db = getFirebaseFirestore();
    const docRef = doc(db, 'users', userId, 'availabilities', availabilityId);
    await deleteDoc(docRef);
    mockStore.deleteAvailability(availabilityId);
  }

  /**
   * Detecção de Conflitos e Sobreposições (Overlap Detection)
   * Fórmula: (NovaStart <= ExistenteEnd) && (NovaEnd >= ExistenteStart)
   */
  async checkOverlap(
    userId: string,
    startDate: string,
    endDate: string,
    excludeId?: string
  ): Promise<OverlapResult> {
    if (!userId || !startDate || !endDate) {
      return { hasOverlap: false, conflictingPeriods: [] };
    }

    const availabilities = await this.listUserAvailabilities(userId);
    const conflicting = availabilities.filter((existing) => {
      if (excludeId && existing.id === excludeId) return false;
      return startDate <= existing.endDate && endDate >= existing.startDate;
    });

    return {
      hasOverlap: conflicting.length > 0,
      conflictingPeriods: conflicting,
    };
  }

  resetForTests() {
    this.memoryAvailabilities.clear();
    this.seedInitial();
  }
}

export const availabilityRepository = new AvailabilityRepository();
