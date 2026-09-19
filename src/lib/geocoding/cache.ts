// ==========================================================
// SMARTTRIP - CACHE DE GEOCODIFICAÇÃO EM DOIS NÍVEIS
// Nível 1: Memória (LRU, até 100 itens)
// Nível 2: LocalStorage (TTL de 24 horas)
// ==========================================================

import { NormalizedDestination } from './types';

const MEMORY_CACHE_LIMIT = 100;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const STORAGE_PREFIX = 'smarttrip_geo_cache_';

interface CacheEntry {
  destinations: NormalizedDestination[];
  timestamp: number;
}

class GeocodingCache {
  private memoryCache: Map<string, CacheEntry> = new Map();

  private normalizeKey(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .normalize('NFC')
      .replace(/\s+/g, ' ');
  }

  get(query: string): NormalizedDestination[] | null {
    const key = this.normalizeKey(query);
    const now = Date.now();

    // 1. Consulta em Memória
    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key)!;
      if (now - entry.timestamp < CACHE_TTL_MS) {
        // Atualiza posição LRU
        this.memoryCache.delete(key);
        this.memoryCache.set(key, entry);
        return entry.destinations;
      }
      this.memoryCache.delete(key);
    }

    // 2. Consulta em LocalStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const itemStr = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
        if (itemStr) {
          const entry: CacheEntry = JSON.parse(itemStr);
          if (now - entry.timestamp < CACHE_TTL_MS) {
            // Promove para cache de memória
            this.setMemory(key, entry);
            return entry.destinations;
          }
          localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
        }
      } catch {
        // Ignora erros de parsing ou quota de storage
      }
    }

    return null;
  }

  set(query: string, destinations: NormalizedDestination[]): void {
    if (!query || !destinations) return;
    const key = this.normalizeKey(query);
    const entry: CacheEntry = {
      destinations,
      timestamp: Date.now(),
    };

    // 1. Gravação em Memória
    this.setMemory(key, entry);

    // 2. Gravação em LocalStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
      } catch {
        // LocalStorage quota cheia ou modo privado
      }
    }
  }

  private setMemory(key: string, entry: CacheEntry): void {
    if (this.memoryCache.size >= MEMORY_CACHE_LIMIT) {
      // Remove o mais antigo (primeira chave do Map)
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }
    this.memoryCache.set(key, entry);
  }

  clear(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignora
      }
    }
  }
}

export const geocodingCache = new GeocodingCache();
