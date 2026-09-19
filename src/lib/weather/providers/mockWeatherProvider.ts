// ==========================================================
// SMARTTRIP - PROVEDOR MOCK METEOROLÓGICO
// Previsões determinísticas para testes automatizados e offline
// ==========================================================

import {
  DestinationWeatherData,
  WeatherRequestParams,
  IWeatherProvider,
} from '../types';
import {
  normalizeOpenMeteoResponse,
  createFallbackForecast,
} from '../normalizer';

export class MockWeatherProvider implements IWeatherProvider {
  name = 'mock';

  // Opções de simulação para testes
  public simulateTimeout = false;
  public simulateHttpError = false;
  public simulatePartialResponse = false;
  public simulateProviderUnavailable = false;
  public customDelayMs = 0;
  public mockReferenceDate: Date = new Date();

  async fetchForecast(params: WeatherRequestParams): Promise<DestinationWeatherData> {
    if (this.simulateTimeout) {
      await new Promise((resolve) => setTimeout(resolve, 4500));
      if (params.signal?.aborted) {
        throw new DOMException('Tempo limite esgotado no provedor meteorológico.', 'AbortError');
      }
    }

    if (this.simulateHttpError) {
      throw new Error('500 Internal Server Error: Serviço de meteorologia fora do ar.');
    }

    if (this.simulateProviderUnavailable) {
      throw new Error('TypeError: Failed to fetch (Rede indisponível).');
    }

    if (this.customDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.customDelayMs));
    }

    if (params.signal?.aborted) {
      throw new DOMException('Consulta cancelada pelo cliente.', 'AbortError');
    }

    // Monta resposta com formato bruto do Open-Meteo
    const rawTimes: string[] = [];
    const rawMaxTemps: number[] = [];
    const rawMinTemps: number[] = [];
    const rawRainProbs: number[] = [];
    const rawPrecipMm: number[] = [];
    const rawCodes: number[] = [];

    const [sY, sM, sD] = params.startDate.split('-').map(Number);
    const [eY, eM, eD] = params.endDate.split('-').map(Number);

    const curr = new Date(Date.UTC(sY, sM - 1, sD));
    const last = new Date(Date.UTC(eY, eM - 1, eD));
    let dayIndex = 0;

    const refUtc = Date.UTC(
      this.mockReferenceDate.getUTCFullYear(),
      this.mockReferenceDate.getUTCMonth(),
      this.mockReferenceDate.getUTCDate()
    );

    while (curr <= last) {
      const dateStr = curr.toISOString().split('T')[0];
      const targetUtc = Date.UTC(curr.getUTCFullYear(), curr.getUTCMonth(), curr.getUTCDate());
      const diffDays = Math.floor((targetUtc - refUtc) / (1000 * 60 * 60 * 24));

      // Se simular resposta parcial, ignora os dias pares
      if (this.simulatePartialResponse && dayIndex % 2 === 1) {
        dayIndex++;
        curr.setUTCDate(curr.getUTCDate() + 1);
        continue;
      }

      // Se a data estiver dentro do horizonte de 16 dias (0 a 16), gera dados
      if (diffDays >= 0 && diffDays <= 16) {
        rawTimes.push(dateStr);
        // Gera dados consistentes baseados no dia e coordenadas
        const isRainyDay = dayIndex === 1; // Dia 2 com chuva para testar alerta de chuva
        rawMaxTemps.push(isRainyDay ? 19 : 24);
        rawMinTemps.push(isRainyDay ? 14 : 16);
        rawRainProbs.push(isRainyDay ? 75 : 15);
        rawPrecipMm.push(isRainyDay ? 12.5 : 0.0);
        rawCodes.push(isRainyDay ? 61 : 0); // 61 = Chuva, 0 = Céu Limpo
      }

      dayIndex++;
      curr.setUTCDate(curr.getUTCDate() + 1);
    }

    const rawOpenMeteo = {
      daily: {
        time: rawTimes,
        temperature_2m_max: rawMaxTemps,
        temperature_2m_min: rawMinTemps,
        precipitation_probability_max: rawRainProbs,
        precipitation_sum: rawPrecipMm,
        weathercode: rawCodes,
      },
    };

    return normalizeOpenMeteoResponse(rawOpenMeteo, params, this.mockReferenceDate);
  }

  reset() {
    this.simulateTimeout = false;
    this.simulateHttpError = false;
    this.simulatePartialResponse = false;
    this.simulateProviderUnavailable = false;
    this.customDelayMs = 0;
    this.mockReferenceDate = new Date();
  }
}

export const mockWeatherProvider = new MockWeatherProvider();
