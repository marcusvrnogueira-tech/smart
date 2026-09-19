// ==========================================================
// SMARTTRIP - TIPOS E CONTRATOS DO SERVIÇO METEOROLÓGICO
// Contrato canônico e independente de provedores externos
// ==========================================================

export type WeatherCondition =
  | 'Ensolarado'
  | 'Parcialmente Nublado'
  | 'Nublado'
  | 'Chuvoso'
  | 'Tempestade'
  | 'Neve'
  | 'Indisponível';

export type ForecastReliability = 'real_forecast' | 'partial_forecast' | 'unavailable';

export interface DailyWeatherForecast {
  date: string;                     // ISO YYYY-MM-DD
  tempMin: number | null;           // Mínima diária em °C
  tempMax: number | null;           // Máxima diária em °C
  rainProbability: number | null;   // 0 a 100%
  precipitationMm: number | null;   // mm de chuva acumulada
  condition: WeatherCondition;      // Categoria canônica
  weatherCode: number | null;       // Código WMO (0 a 99)
  weatherTip: string;               // Dica de vestuário/atividade em PT-BR
  hasForecast: boolean;             // true se dado for real; false se fora do horizonte ou indisponível
}

export interface WeatherSummary {
  avgTemp: number | null;           // Temperatura média ponderada do período
  hasRainRisk: boolean;             // true se algum dia tiver rainProbability >= 50%
  rainyDaysCount: number;           // Quantidade de dias com chuva prevista
  mainCondition: string;            // Resumo textual do clima
  reliability: ForecastReliability; // Confiabilidade do horizonte
}

export interface DestinationWeatherData {
  destinationCoordinates: {
    latitude: number;
    longitude: number;
  };
  period: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
  daily: DailyWeatherForecast[];
  summary: WeatherSummary;
}

export interface WeatherRequestParams {
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  signal?: AbortSignal;
}

export interface IWeatherProvider {
  name: string;
  fetchForecast(params: WeatherRequestParams): Promise<DestinationWeatherData>;
}
