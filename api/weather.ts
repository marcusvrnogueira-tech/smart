// ==========================================================
// SMARTTRIP - VERCEL SERVERLESS FUNCTION: /api/weather
// Handler server-side para execução na nuvem Vercel
// ==========================================================

import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleWeatherRequest } from '../src/server/weatherHandler.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  return handleWeatherRequest(req, res);
}
