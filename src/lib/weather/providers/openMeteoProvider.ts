// ==========================================================
// SMARTTRIP - PROVEDOR METEOROLÓGICO REAL (OPEN-METEO)
// API de previsão numérica global de alta precisão
// ==========================================================

import {
  DestinationWeatherData,
  WeatherRequestParams,
  IWeatherProvider,
} from '../types';
import { normalizeOpenMeteoResponse } from '../normalizer';

export class OpenMeteoProvider implements IWeatherProvider {
  name = 'open-meteo';

  async fetchForecast(params: WeatherRequestParams): Promise<DestinationWeatherData> {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', params.latitude.toFixed(4));
    url.searchParams.set('longitude', params.longitude.toFixed(4));
    url.searchParams.set(
      'daily',
      'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum'
    );
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('start_date', params.startDate);
    url.searchParams.set('end_date', params.endDate);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'SmartTrip-TravelPlanner/1.0 (contact: marcus@smarttrip.local)',
        },
        signal: params.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Falha no Open-Meteo: HTTP ${response.status} (${response.statusText})`
        );
      }

      const rawJson = await response.json();
      return normalizeOpenMeteoResponse(rawJson, params);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err;
      }
      throw new Error(`Erro ao consultar API meteorológica: ${err.message}`);
    }
  }
}

export const openMeteoProvider = new OpenMeteoProvider();
