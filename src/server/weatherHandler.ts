// ==========================================================
// SMARTTRIP - HANDLER SERVER-SIDE DO ENDPOINT /api/weather
// Valida parâmetros, protege chaves server-side e normaliza saída
// ==========================================================

import { IncomingMessage, ServerResponse } from 'node:http';
import { weatherService } from '../lib/weather/weatherService';

export interface WeatherApiQuery {
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
}

/**
 * Processador da requisição /api/weather
 */
export async function handleWeatherRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const latStr = url.searchParams.get('latitude');
  const lngStr = url.searchParams.get('longitude');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  res.setHeader('Content-Type', 'application/json');

  // 1. Validação de presença
  if (!latStr || !lngStr || !startDate || !endDate) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        error: 'Parâmetros obrigatórios ausentes. Informe: latitude, longitude, startDate e endDate.',
      })
    );
    return;
  }

  const latitude = parseFloat(latStr);
  const longitude = parseFloat(lngStr);

  // 2. Validação numérica de coordenadas
  if (isNaN(latitude) || isNaN(longitude)) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        error: 'Coordenadas inválidas: latitude e longitude devem ser números decimais.',
      })
    );
    return;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        error: 'Coordenadas fora dos limites válidos: latitude [-90, 90], longitude [-180, 180].',
      })
    );
    return;
  }

  // 3. Validação de formato de data
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(startDate) || !isoRegex.test(endDate)) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        error: 'Formato de data inválido. Use o padrão ISO AAAA-MM-DD.',
      })
    );
    return;
  }

  if (endDate < startDate) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        error: 'A data de término não pode ser anterior à data de início.',
      })
    );
    return;
  }

  try {
    const forecast = await weatherService.getForecast({
      latitude,
      longitude,
      startDate,
      endDate,
    });

    res.statusCode = 200;
    res.end(JSON.stringify(forecast));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: err.message || 'Falha ao processar previsão do tempo.',
      })
    );
  }
}
