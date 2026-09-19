// ==========================================================
// SMARTTRIP - CACHE METEOROLÓGICO EM DOIS NÍVEIS
// Nível 1: Memória (LRU, até 50 itens)
// Nível 2: LocalStorage (TTL de 3 horas)
// ==========================================================

import { DestinationWeatherData, WeatherRequestParams } from './types';

const MEMORY_CACHE_LIMIT = 50;
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 horas
const STORAGE_PREFIX = 'smarttrip_weather_cache_';

interface WeatherCacheEntry {
  data: DestinationWeatherData;
  timestamp: number;
}

class WeatherCache {
  private memoryCache: Map<string, WeatherCacheEntry> = new Map();

  private generateKey(params: WeatherRequestParams): string {
    const lat = params.latitude.toFixed(2);
    const lng = params.longitude.toFixed(2);
    return `${lat}_${lng}_${params.startDate}_${params.endDate}`;
  }

  get(params: WeatherRequestParams): DestinationWeatherData | null {
    const key = this.generateKey(params);
    const now = Date.now();

    // 1. Memória
    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key)!;
      if (now - entry.timestamp < CACHE_TTL_MS) {
        // Atualiza posição LRU
        this.memoryCache.delete(key);
        this.memoryCache.set(key, entry);
        return entry.data;
      }
      this.memoryCache.delete(key);
    }

    // 2. LocalStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const itemStr = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
        if (itemStr) {
          const entry: WeatherCacheEntry = JSON.parse(itemStr);
          if (now - entry.timestamp < CACHE_TTL_MS) {
            this.setMemory(key, entry);
            return entry.data;
          }
          localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
        }
      } catch {
        // Ignora erros de parsing
      }
    }

    return null;
  }

  set(params: WeatherRequestParams, data: DestinationWeatherData): void {
    if (!data || !data.daily) return;
    const key = this.generateKey(params);
    const entry: WeatherCacheEntry = {
      data,
      timestamp: Date.now(),
    };

    this.setMemory(key, entry);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
      } catch {
        // Quota cheia
      }
    }
  }

  private setMemory(key: string, entry: WeatherCacheEntry): void {
    if (this.memoryCache.size >= MEMORY_CACHE_LIMIT) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) this.memoryCache.delete(firstKey);
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

export const weatherCache = new WeatherCache();
