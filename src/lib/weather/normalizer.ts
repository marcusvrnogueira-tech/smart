// ==========================================================
// SMARTTRIP - NORMALIZADOR E VALIDADOR METEOROLÓGICO
// Mapeamento WMO, controle de horizonte de 16 dias e ausência explícita
// ==========================================================

import {
  DailyWeatherForecast,
  WeatherSummary,
  DestinationWeatherData,
  WeatherCondition,
  ForecastReliability,
  WeatherRequestParams,
} from './types';

export const MAX_FORECAST_HORIZON_DAYS = 16;

/**
 * Validação estrita de parâmetros de entrada meteorológicos
 */
export function validateWeatherParams(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): void {
  // 1. Coordenadas
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Coordenadas geográficas inválidas: latitude e longitude devem ser numéricas.');
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error(`Latitude inválida (${latitude}). O valor deve estar no intervalo [-90.0, 90.0].`);
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error(`Longitude inválida (${longitude}). O valor deve estar no intervalo [-180.0, 180.0].`);
  }

  // 2. Datas
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(startDate) || !isoRegex.test(endDate)) {
    throw new Error('Formato de data inválido. Use o padrão ISO AAAA-MM-DD.');
  }

  const [startY, startM, startD] = startDate.split('-').map(Number);
  const [endY, endM, endD] = endDate.split('-').map(Number);

  const startUtc = Date.UTC(startY, startM - 1, startD);
  const endUtc = Date.UTC(endY, endM - 1, endD);

  if (endUtc < startUtc) {
    throw new Error('A data de término não pode ser anterior à data de início.');
  }

  const diffDays = Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays < 1 || diffDays > 15) {
    throw new Error(`Duração de viagem inválida (${diffDays} dias). O SmartTrip MVP suporta de 1 a 15 dias (RN-001).`);
  }
}

/**
 * Mapeia códigos numéricos da Organização Meteorológica Mundial (WMO)
 * para as categorias canônicas do SmartTrip e gera dicas práticas em português.
 */
export function wmoToCondition(code: number | null | undefined): {
  condition: WeatherCondition;
  tip: string;
} {
  if (code === null || code === undefined || isNaN(code)) {
    return {
      condition: 'Indisponível',
      tip: 'Previsão determinística indisponível para esta data.',
    };
  }

  switch (code) {
    case 0:
      return {
        condition: 'Ensolarado',
        tip: 'Tempo aberto e céu limpo. Excelente para atividades ao ar livre e caminhadas.',
      };
    case 1:
    case 2:
      return {
        condition: 'Parcialmente Nublado',
        tip: 'Clima ameno e agradável. Ótimo para passeios urbanos e exploração cultural.',
      };
    case 3:
    case 45:
    case 48:
      return {
        condition: 'Nublado',
        tip: 'Céu encoberto. Boa pedida para fotos com luz difusa e visitas a centros históricos.',
      };
    case 51:
    case 53:
    case 55:
      return {
        condition: 'Chuvoso',
        tip: 'Garoa leve prevista. Tenha um guarda-chuva compacto ou capa leve à mão.',
      };
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return {
        condition: 'Chuvoso',
        tip: 'Chuva prevista. Priorize museus, mercados gastronômicos e atrações cobertas.',
      };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {
        condition: 'Neve',
        tip: 'Queda de neve prevista. Utilize calçados antiderrapantes e roupas térmicas.',
      };
    case 95:
    case 96:
    case 99:
      return {
        condition: 'Tempestade',
        tip: 'Risco de trovoada e tempestade. Evite áreas descampadas e passeios aquáticos.',
      };
    default:
      return {
        condition: 'Parcialmente Nublado',
        tip: 'Condições meteorológicas estáveis.',
      };
  }
}

/**
 * Gera array de datas consecutivas no intervalo [startDate, endDate]
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const [sY, sM, sD] = startDate.split('-').map(Number);
  const [eY, eM, eD] = endDate.split('-').map(Number);

  const curr = new Date(Date.UTC(sY, sM - 1, sD));
  const last = new Date(Date.UTC(eY, eM - 1, eD));

  while (curr <= last) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  return dates;
}

/**
 * Verifica se uma data específica está dentro do horizonte de previsão (até 16 dias de hoje)
 */
export function isDateWithinHorizon(
  dateStr: string,
  referenceDate: Date = new Date(),
  maxHorizonDays: number = MAX_FORECAST_HORIZON_DAYS
): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetUtc = Date.UTC(y, m - 1, d);

  const refUtc = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate()
  );

  const diffDays = Math.floor((targetUtc - refUtc) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= maxHorizonDays;
}

/**
 * Cria resposta de fallback gracioso para quando o serviço falhar ou estiver offline.
 * REGRA: Não derruba a aplicação e não inventa dados climáticos falsos.
 */
export function createFallbackForecast(
  params: WeatherRequestParams,
  reliability: ForecastReliability = 'unavailable',
  mainCondition: string = 'Previsão meteorológica temporariamente indisponível.'
): DestinationWeatherData {
  const dates = generateDateRange(params.startDate, params.endDate);

  const daily: DailyWeatherForecast[] = dates.map((date) => ({
    date,
    tempMin: null,
    tempMax: null,
    rainProbability: null,
    precipitationMm: null,
    condition: 'Indisponível',
    weatherCode: null,
    weatherTip: 'Consulte as condições climáticas mais próximo à data da viagem.',
    hasForecast: false, // Representação explícita da ausência de dados!
  }));

  const summary: WeatherSummary = {
    avgTemp: null,
    hasRainRisk: false,
    rainyDaysCount: 0,
    mainCondition,
    reliability,
  };

  return {
    destinationCoordinates: {
      latitude: params.latitude,
      longitude: params.longitude,
    },
    period: {
      startDate: params.startDate,
      endDate: params.endDate,
      totalDays: dates.length,
    },
    daily,
    summary,
  };
}

/**
 * Normaliza a resposta crua da API Open-Meteo para o contrato canônico SmartTrip.
 * Aplica rigorosamente o horizonte de 16 dias e evita qualquer invenção de dados.
 */
export function normalizeOpenMeteoResponse(
  raw: any,
  params: WeatherRequestParams,
  referenceDate: Date = new Date()
): DestinationWeatherData {
  const requestedDates = generateDateRange(params.startDate, params.endDate);

  // Mapeamento dos dados brutos retornados pelo Open-Meteo
  const rawDaily = raw?.daily || {};
  const rawTimes: string[] = Array.isArray(rawDaily.time) ? rawDaily.time : [];
  const rawMaxTemps: number[] = Array.isArray(rawDaily.temperature_2m_max) ? rawDaily.temperature_2m_max : [];
  const rawMinTemps: number[] = Array.isArray(rawDaily.temperature_2m_min) ? rawDaily.temperature_2m_min : [];
  const rawRainProbs: number[] = Array.isArray(rawDaily.precipitation_probability_max)
    ? rawDaily.precipitation_probability_max
    : [];
  const rawPrecipMm: number[] = Array.isArray(rawDaily.precipitation_sum) ? rawDaily.precipitation_sum : [];
  const rawCodes: number[] = Array.isArray(rawDaily.weathercode) ? rawDaily.weathercode : [];

  const rawMap = new Map<string, {
    maxTemp: number;
    minTemp: number;
    rainProb: number;
    precipMm: number;
    code: number;
  }>();

  for (let i = 0; i < rawTimes.length; i++) {
    rawMap.set(rawTimes[i], {
      maxTemp: rawMaxTemps[i],
      minTemp: rawMinTemps[i],
      rainProb: rawRainProbs[i],
      precipMm: rawPrecipMm[i],
      code: rawCodes[i],
    });
  }

  let realForecastCount = 0;
  let totalTempSum = 0;
  let tempDaysCount = 0;
  let rainyDaysCount = 0;
  let hasRainRisk = false;

  const daily: DailyWeatherForecast[] = requestedDates.map((date) => {
    const isWithinHorizon = isDateWithinHorizon(date, referenceDate);
    const rawData = rawMap.get(date);

    // REGRA CAPITAL: Se fora do horizonte de 16 dias OU se o modelo não tiver dados para o dia
    if (!isWithinHorizon || !rawData || rawData.maxTemp === undefined) {
      return {
        date,
        tempMin: null,
        tempMax: null,
        rainProbability: null,
        precipitationMm: null,
        condition: 'Indisponível',
        weatherCode: null,
        weatherTip: !isWithinHorizon
          ? 'Data além do horizonte de previsão determinística (> 16 dias).'
          : 'Dados meteorológicos indisponíveis.',
        hasForecast: false, // NENHUMA INVENÇÃO DE DADOS
      };
    }

    // Dado real do modelo Open-Meteo
    realForecastCount++;
    const tempMin = Math.round(rawData.minTemp);
    const tempMax = Math.round(rawData.maxTemp);
    const rainProbability = Math.min(100, Math.max(0, Math.round(rawData.rainProb || 0)));
    const precipitationMm = Math.round((rawData.precipMm || 0) * 10) / 10;
    const { condition, tip } = wmoToCondition(rawData.code);

    totalTempSum += (tempMin + tempMax) / 2;
    tempDaysCount++;

    if (rainProbability >= 50) {
      hasRainRisk = true;
      rainyDaysCount++;
    }

    return {
      date,
      tempMin,
      tempMax,
      rainProbability,
      precipitationMm,
      condition,
      weatherCode: rawData.code,
      weatherTip: tip,
      hasForecast: true,
    };
  });

  // Confiabilidade da janela consultada
  let reliability: ForecastReliability = 'unavailable';
  if (realForecastCount === requestedDates.length && requestedDates.length > 0) {
    reliability = 'real_forecast';
  } else if (realForecastCount > 0) {
    reliability = 'partial_forecast';
  }

  const avgTemp = tempDaysCount > 0 ? Math.round((totalTempSum / tempDaysCount) * 10) / 10 : null;

  // Montagem da síntese textual
  let mainCondition = 'Informações meteorológicas completas para o período.';
  if (reliability === 'unavailable') {
    mainCondition = 'Previsão determinística indisponível para viagens a mais de 16 dias da data atual.';
  } else if (reliability === 'partial_forecast') {
    mainCondition = `Previsão parcial: dados disponíveis para ${realForecastCount} de ${requestedDates.length} dias.`;
  } else if (hasRainRisk) {
    mainCondition = `Atenção: previsão de chuva em ${rainyDaysCount} ${rainyDaysCount === 1 ? 'dia' : 'dias'} do itinerário.`;
  } else {
    mainCondition = 'Condições favoráveis com baixo risco de precipitação durante o roteiro.';
  }

  const summary: WeatherSummary = {
    avgTemp,
    hasRainRisk,
    rainyDaysCount,
    mainCondition,
    reliability,
  };

  return {
    destinationCoordinates: {
      latitude: params.latitude,
      longitude: params.longitude,
    },
    period: {
      startDate: params.startDate,
      endDate: params.endDate,
      totalDays: requestedDates.length,
    },
    daily,
    summary,
  };
}
