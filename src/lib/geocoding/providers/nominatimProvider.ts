// ==========================================================
// SMARTTRIP - PROVEDOR NOMINATIM (OPENSTREETMAP)
// Geocodificação real sem necessidade de chaves de API pagas
// Respeito estrito à política de uso (1 req/segundo e User-Agent)
// ==========================================================

import {
  NormalizedDestination,
  GeocodingSearchOptions,
  IGeocodingProvider,
} from '../types';
import { normalizeDestinationList } from '../normalizer';

export class NominatimProvider implements IGeocodingProvider {
  name = 'nominatim';

  private lastRequestTimestamp = 0;
  private minIntervalMs = 1000; // Máximo 1 requisição por segundo

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTimestamp;
    if (elapsed < this.minIntervalMs) {
      const waitTime = this.minIntervalMs - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTimestamp = Date.now();
  }

  async search(query: string, options?: GeocodingSearchOptions): Promise<NormalizedDestination[]> {
    await this.enforceRateLimit();

    const limit = options?.limit || 5;
    const language = options?.language || 'pt-BR,pt;q=0.9,en;q=0.8';

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('accept-language', language);

    if (options?.countryCodes && options.countryCodes.length > 0) {
      url.searchParams.set('countrycodes', options.countryCodes.join(',').toLowerCase());
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'SmartTrip-TravelPlanner/1.0 (contact: marcus@smarttrip.local)',
          Accept: 'application/json',
        },
        signal: options?.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Erro no provedor Nominatim: HTTP ${response.status} (${response.statusText})`
        );
      }

      const rawJson = await response.json();
      return normalizeDestinationList(rawJson, this.name);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err; // Re-lança para controle de timeout ou cancelamento intencional
      }
      throw new Error(`Falha de comunicação com o provedor geográfico: ${err.message}`);
    }
  }
}

export const nominatimProvider = new NominatimProvider();
