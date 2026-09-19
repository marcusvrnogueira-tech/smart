// ==========================================================
// SMARTTRIP - SERVIÇO CENTRAL METEOROLÓGICO
// Orquestra validação, cache, timeout e degradação graciosa
// ==========================================================

import {
  DestinationWeatherData,
  WeatherRequestParams,
  IWeatherProvider,
} from './types';
import {
  validateWeatherParams,
  createFallbackForecast,
} from './normalizer';
import { weatherCache } from './cache';
import { openMeteoProvider } from './providers/openMeteoProvider';
import { mockWeatherProvider } from './providers/mockWeatherProvider';

export const DEFAULT_WEATHER_TIMEOUT_MS = 4000;

export class WeatherService {
  private activeProvider: IWeatherProvider;

  constructor(defaultProvider?: IWeatherProvider) {
    this.activeProvider = defaultProvider || openMeteoProvider;
  }

  setProvider(provider: IWeatherProvider): void {
    this.activeProvider = provider;
  }

  getProvider(): IWeatherProvider {
    return this.activeProvider;
  }

  /**
   * Consulta a previsão do tempo para um destino e período
   * - Valida coordenadas e intervalo de datas
   * - Consulta cache em dois níveis (TTL de 3 horas)
   * - Aplica timeout de 4000ms
   * - DEGRADAÇÃO GRACIOSA: falhas externas nunca derrubam o aplicativo!
   */
  async getForecast(params: WeatherRequestParams): Promise<DestinationWeatherData> {
    // 1. Validação estrita de parâmetros (lança erro se parâmetros forem ilegais)
    validateWeatherParams(
      params.latitude,
      params.longitude,
      params.startDate,
      params.endDate
    );

    // 2. Consulta de Cache em Dois Níveis (TTL 3h)
    const cached = weatherCache.get(params);
    if (cached) {
      return cached;
    }

    // 3. Controle de Timeout (4000ms)
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, DEFAULT_WEATHER_TIMEOUT_MS);

    try {
      const signal = params.signal || abortController.signal;

      const result = await this.activeProvider.fetchForecast({
        ...params,
        signal,
      });

      clearTimeout(timeoutId);

      // Salva no cache somente previsões íntegras
      if (result && result.daily && result.daily.length > 0) {
        weatherCache.set(params, result);
      }

      return result;
    } catch (err: any) {
      clearTimeout(timeoutId);

      console.warn(`[WeatherService] Provedor "${this.activeProvider.name}" falhou: ${err.message}. Ativando degradação graciosa.`);

      // Tentativa de fallback no provedor Mock se o primário for Open-Meteo
      if (this.activeProvider.name !== 'mock') {
        try {
          const mockResult = await mockWeatherProvider.fetchForecast(params);
          if (mockResult && mockResult.daily.length > 0) {
            return mockResult;
          }
        } catch {
          // Ignora
        }
      }

      // 4. DEGRADAÇÃO GRACIOSA: Retorna fallback estruturado sem quebrar o app
      const fallbackReason = err.name === 'AbortError'
        ? 'Tempo limite de 4 segundos excedido ao consultar meteorologia.'
        : `Serviço meteorológico indisponível: ${err.message}`;

      return createFallbackForecast(params, 'unavailable', fallbackReason);
    }
  }
}

export const weatherService = new WeatherService();
