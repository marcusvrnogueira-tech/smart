// ==========================================================
// SMARTTRIP - SERVIÇO CENTRAL DE BUSCA E NORMALIZAÇÃO DE DESTINOS
// Orquestra validação, cache, timeout, rate limiting e provedores
// ==========================================================

import {
  NormalizedDestination,
  GeocodingSearchOptions,
  IGeocodingProvider,
} from './types';
import { sanitizeQuery } from './normalizer';
import { geocodingCache } from './cache';
import { mockGeocodingProvider } from './providers/mockProvider';
import { nominatimProvider } from './providers/nominatimProvider';

export const MIN_QUERY_LENGTH = 3;
export const DEFAULT_TIMEOUT_MS = 4000;

export class GeocodingService {
  private activeProvider: IGeocodingProvider;
  private currentAbortController: AbortController | null = null;

  constructor(defaultProvider?: IGeocodingProvider) {
    // Provedor padrão: Nominatim com fallback em Mock
    this.activeProvider = defaultProvider || nominatimProvider;
  }

  setProvider(provider: IGeocodingProvider): void {
    this.activeProvider = provider;
  }

  getProvider(): IGeocodingProvider {
    return this.activeProvider;
  }

  /**
   * Busca e normalização de destinos geográficos
   * - Sanitiza a entrada
   * - Bloqueia queries com menos de 3 caracteres
   * - Consulta cache em dois níveis
   * - Cancela chamadas anteriores via AbortController
   * - Aplica timeout de 4000ms
   */
  async search(
    rawQuery: string,
    options?: GeocodingSearchOptions
  ): Promise<NormalizedDestination[]> {
    const query = sanitizeQuery(rawQuery);

    // 1. Regra de Limite Mínimo de 3 Caracteres (CA-GEO-001)
    if (query.length < MIN_QUERY_LENGTH) {
      this.cancelInFlight();
      return [];
    }

    // 2. Consulta de Cache em Dois Níveis (CA-GEO-009)
    const cached = geocodingCache.get(query);
    if (cached) {
      return cached;
    }

    // 3. Cancelamento de Requisições Anteriores em Trânsito (CA-GEO-003)
    this.cancelInFlight();
    const abortController = new AbortController();
    this.currentAbortController = abortController;

    // 4. Timeout de 4000ms (CA-GEO-008)
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, DEFAULT_TIMEOUT_MS);

    try {
      // Conecta o signal externo (se fornecido) com o controller interno
      const signal = options?.signal || abortController.signal;

      const results = await this.activeProvider.search(query, {
        ...options,
        signal,
      });

      clearTimeout(timeoutId);

      // 5. Armazena no Cache de Resultados
      if (results && results.length > 0) {
        geocodingCache.set(query, results);
      }

      return results;
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        throw new Error('Tempo limite excedido ao buscar destino (4 segundos). Tente novamente.');
      }

      // Em ambiente de desenvolvimento ou falha de rede do Nominatim, tenta fallback no Mock
      if (this.activeProvider.name !== 'mock') {
        try {
          const fallbackResults = await mockGeocodingProvider.search(query, options);
          if (fallbackResults.length > 0) {
            return fallbackResults;
          }
        } catch {
          // Ignora falha de fallback
        }
      }

      throw new Error(`Não foi possível consultar os destinos: ${err.message}`);
    } finally {
      if (this.currentAbortController === abortController) {
        this.currentAbortController = null;
      }
    }
  }

  cancelInFlight(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
  }
}

export const geocodingService = new GeocodingService();
