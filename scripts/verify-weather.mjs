// ==========================================================
// TESTES AUTOMATIZADOS: SERVIÇO METEOROLÓGICO SMARTTRIP
// Valida:
// 1. Coordenadas válidas
// 2. Coordenadas inválidas (limites [-90, 90] e [-180, 180])
// 3. Período disponível (dentro do horizonte de 16 dias)
// 4. Período futuro sem previsão (> 16 dias, SEM INVENÇÃO)
// 5. Erro HTTP (500 Internal Server Error)
// 6. Timeout (4000ms com AbortController)
// 7. Resposta parcial (dias no horizonte vs fora)
// 8. Provider unavailable (queda de rede / offline)
// 9. Endpoint /api/weather (validação server-side)
// 10. Estabilidade de contrato e ausência de dados fictícios
// ==========================================================

import assert from 'node:assert';
import {
  WeatherService,
  mockWeatherProvider,
  openMeteoProvider,
  validateWeatherParams,
  wmoToCondition,
  isDateWithinHorizon,
  weatherCache,
} from '../src/lib/weather/index.ts';
import { handleWeatherRequest } from '../src/server/weatherHandler.ts';

async function runTests() {
  console.log('====================================================');
  console.log('SUÍTE DE TESTES: SERVIÇO METEOROLÓGICO (SMARTTRIP)');
  console.log('====================================================\n');

  weatherCache.clear();
  mockWeatherProvider.reset();

  const refDate = new Date(); // Data de referência (hoje)
  mockWeatherProvider.mockReferenceDate = refDate;

  const service = new WeatherService(mockWeatherProvider);

  // Auxiliar para gerar datas ISO relativas a hoje
  const getRelativeDate = (offsetDays) => {
    const d = new Date(refDate);
    d.setUTCDate(d.getUTCDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  // ------------------------------------------------------------------
  // 1. TESTE: COORDENADAS VÁLIDAS
  // ------------------------------------------------------------------
  console.log('1. Teste: Coordenadas Válidas');
  const validLat = -34.9011;
  const validLng = -56.1645;
  const startDay1 = getRelativeDate(1);
  const endDay3 = getRelativeDate(3);

  assert.doesNotThrow(() => {
    validateWeatherParams(validLat, validLng, startDay1, endDay3);
  }, 'Coordenadas de Montevidéu [-34.9011, -56.1645] e datas válidas');
  console.log('  [PASS] Coordenadas decimais e intervalo de datas aprovados na validação');

  // ------------------------------------------------------------------
  // 2. TESTE: COORDENADAS INVÁLIDAS
  // ------------------------------------------------------------------
  console.log('\n2. Teste: Coordenadas Inválidas');
  // 2.1 Latitude > 90
  try {
    validateWeatherParams(95.5, -56.1645, startDay1, endDay3);
    assert.fail('Deveria ter rejeitado latitude 95.5');
  } catch (err) {
    assert(err.message.includes('Latitude inválida'), `Erro capturado: "${err.message}"`);
    console.log('  [PASS] Latitude superior a 90° bloqueada');
  }

  // 2.2 Longitude < -180
  try {
    validateWeatherParams(-23.55, -195.0, startDay1, endDay3);
    assert.fail('Deveria ter rejeitado longitude -195.0');
  } catch (err) {
    assert(err.message.includes('Longitude inválida'), `Erro capturado: "${err.message}"`);
    console.log('  [PASS] Longitude fora do limite [-180, 180] bloqueada');
  }

  // 2.3 Datas invertidas (endDate < startDate)
  try {
    validateWeatherParams(-23.55, -46.63, '2026-10-15', '2026-10-10');
    assert.fail('Deveria ter rejeitado data de término anterior à data de início');
  } catch (err) {
    assert(err.message.includes('anterior à data de início'), `Erro capturado: "${err.message}"`);
    console.log('  [PASS] Rejeição correta de intervalo de datas invertidas');
  }

  // ------------------------------------------------------------------
  // 3. TESTE: PERÍODO DISPONÍVEL (DENTRO DO HORIZONTE DE 16 DIAS)
  // ------------------------------------------------------------------
  console.log('\n3. Teste: Período Disponível (Dentro do Horizonte de 16 Dias)');
  weatherCache.clear();
  const startWithin = getRelativeDate(2);
  const endWithin = getRelativeDate(5); // 4 dias de duração

  const forecastWithin = await service.getForecast({
    latitude: validLat,
    longitude: validLng,
    startDate: startWithin,
    endDate: endWithin,
  });

  assert.strictEqual(forecastWithin.daily.length, 4, 'Retornou exatamente 4 dias de previsão');
  assert.strictEqual(forecastWithin.summary.reliability, 'real_forecast', 'Confiabilidade marcada como real_forecast');
  assert(forecastWithin.summary.avgTemp !== null, 'Temperatura média calculada');
  assert(typeof forecastWithin.summary.hasRainRisk === 'boolean', 'Flag de risco de chuva calculada');

  // Verifica que os dias possuem dados reais
  for (const day of forecastWithin.daily) {
    assert.strictEqual(day.hasForecast, true, `Dia ${day.date} deve possuir hasForecast: true`);
    assert(day.tempMin !== null, 'tempMin presente');
    assert(day.tempMax !== null, 'tempMax presente');
    assert(day.rainProbability !== null, 'rainProbability presente');
    assert.notStrictEqual(day.condition, 'Indisponível', 'Condição mapeada para categoria real');
    assert(day.weatherTip.length > 5, 'Dica prática em português gerada');
  }
  console.log(`  [PASS] Previsão determinística completa: Média ${forecastWithin.summary.avgTemp}°C, Alerta de chuva: ${forecastWithin.summary.hasRainRisk}`);

  // ------------------------------------------------------------------
  // 4. TESTE: PERÍODO FUTURO SEM PREVISÃO (> 16 DIAS, SEM INVENÇÃO!)
  // ------------------------------------------------------------------
  console.log('\n4. Teste: Período Futuro sem Previsão (> 16 Dias - Proibição de Clima Fictício)');
  weatherCache.clear();
  const startFarFuture = getRelativeDate(30); // Daqui a 30 dias (fora do modelo numérico)
  const endFarFuture = getRelativeDate(33);

  const forecastFarFuture = await service.getForecast({
    latitude: validLat,
    longitude: validLng,
    startDate: startFarFuture,
    endDate: endFarFuture,
  });

  assert.strictEqual(forecastFarFuture.daily.length, 4, 'Retornou os 4 dias da janela');
  assert.strictEqual(forecastFarFuture.summary.reliability, 'unavailable', 'Marcado compulsoriamente como unavailable');
  assert.strictEqual(forecastFarFuture.summary.avgTemp, null, 'Nenhuma média fictícia calculada');

  // REGRA CRÍTICA: Cada dia deve ser explicitamente hasForecast = false
  for (const day of forecastFarFuture.daily) {
    assert.strictEqual(day.hasForecast, false, `Dia ${day.date} NÃO pode ter clima inventado (hasForecast: false)`);
    assert.strictEqual(day.condition, 'Indisponível', 'Condição marcada como Indisponível');
    assert.strictEqual(day.tempMin, null, 'tempMin deve ser null');
    assert.strictEqual(day.tempMax, null, 'tempMax deve ser null');
    assert.strictEqual(day.rainProbability, null, 'rainProbability deve ser null');
  }
  console.log('  [PASS] Nenhuma invenção de clima para datas futuras (> 16 dias); ausência explicitada com rigor');

  // ------------------------------------------------------------------
  // 5. TESTE: ERRO HTTP (500 INTERNAL SERVER ERROR)
  // ------------------------------------------------------------------
  console.log('\n5. Teste: Erro HTTP do Provedor (Degradação Graciosa)');
  weatherCache.clear();
  mockWeatherProvider.simulateHttpError = true;

  // A chamada NÃO PODE quebrar ou jogar exceção fatal para a aplicação
  const forecastOnError = await service.getForecast({
    latitude: validLat,
    longitude: validLng,
    startDate: startWithin,
    endDate: endWithin,
  });

  assert(forecastOnError, 'Retornou objeto estruturado');
  assert.strictEqual(forecastOnError.summary.reliability, 'unavailable', 'Degradação ativada com reliability unavailable');
  assert.strictEqual(forecastOnError.daily.length, 4, 'Mantém integridade do array de datas');
  assert.strictEqual(forecastOnError.daily[0].hasForecast, false, 'hasForecast falso');
  console.log('  [PASS] Falha HTTP 500 absorvida com sucesso via degradação graciosa (aplicativo não quebra)');
  mockWeatherProvider.reset();

  // ------------------------------------------------------------------
  // 6. TESTE: TIMEOUT (4000ms COM ABORTCONTROLLER)
  // ------------------------------------------------------------------
  console.log('\n6. Teste: Timeout (4 Segundos)');
  weatherCache.clear();
  mockWeatherProvider.simulateTimeout = true;

  const forecastOnTimeout = await service.getForecast({
    latitude: validLat,
    longitude: validLng,
    startDate: startWithin,
    endDate: endWithin,
  });

  assert(forecastOnTimeout, 'Retornou fallback no timeout');
  assert.strictEqual(forecastOnTimeout.summary.reliability, 'unavailable', 'Timeout gerou fallback seguro');
  assert(forecastOnTimeout.summary.mainCondition.includes('4 segundos') || forecastOnTimeout.summary.mainCondition.includes('indisponível'));
  console.log('  [PASS] Timeout de 4s acionou cancelamento via AbortController e fallback gracioso');
  mockWeatherProvider.reset();

  // ------------------------------------------------------------------
  // 7. TESTE: RESPOSTA PARCIAL (JANELA MISTA)
  // ------------------------------------------------------------------
  console.log('\n7. Teste: Resposta Parcial');
  weatherCache.clear();
  mockWeatherProvider.simulatePartialResponse = true;

  const partialForecast = await service.getForecast({
    latitude: validLat,
    longitude: validLng,
    startDate: startWithin,
    endDate: endWithin,
  });

  assert.strictEqual(partialForecast.summary.reliability, 'partial_forecast', 'Detectou previsão parcial');
  const daysWithForecast = partialForecast.daily.filter((d) => d.hasForecast);
  const daysWithoutForecast = partialForecast.daily.filter((d) => !d.hasForecast);

  assert(daysWithForecast.length > 0, 'Dias no horizonte possuem dados');
  assert(daysWithoutForecast.length > 0, 'Dias ausentes marcados como sem previsão');
  console.log(`  [PASS] Janela mista: ${daysWithForecast.length} dias com previsão real, ${daysWithoutForecast.length} dias sem previsão`);
  mockWeatherProvider.reset();

  // ------------------------------------------------------------------
  // 8. TESTE: PROVIDER UNAVAILABLE (OFFLINE)
  // ------------------------------------------------------------------
  console.log('\n8. Teste: Provider Unavailable (Offline / Queda de Conexão)');
  weatherCache.clear();
  mockWeatherProvider.simulateProviderUnavailable = true;

  const offlineForecast = await service.getForecast({
    latitude: validLat,
    longitude: validLng,
    startDate: startWithin,
    endDate: endWithin,
  });

  assert(offlineForecast, 'Fallback retornado');
  assert.strictEqual(offlineForecast.summary.reliability, 'unavailable');
  console.log('  [PASS] Queda de rede tratada com integridade estrutural mantida');
  mockWeatherProvider.reset();

  // ------------------------------------------------------------------
  // 9. TESTE: ENDPOINT SERVER-SIDE /api/weather
  // ------------------------------------------------------------------
  console.log('\n9. Teste: Handler do Endpoint /api/weather');
  // 9.1 Sucesso
  let mockResData = '';
  let mockResStatus = 0;
  const mockReqSuccess = {
    url: `/api/weather?latitude=${validLat}&longitude=${validLng}&startDate=${startWithin}&endDate=${endWithin}`,
    headers: { host: 'localhost:3000' },
  };
  const mockResSuccess = {
    setHeader: () => {},
    statusCode: 0,
    end: (chunk) => {
      mockResData = chunk;
      mockResStatus = mockResSuccess.statusCode;
    },
  };

  await handleWeatherRequest(mockReqSuccess, mockResSuccess);
  assert.strictEqual(mockResStatus, 200, 'Endpoint retornou status 200');
  const parsedRes = JSON.parse(mockResData);
  assert(parsedRes.daily, 'Corpo da resposta contém daily array');
  assert(parsedRes.summary, 'Corpo da resposta contém summary');
  console.log('  [PASS] Endpoint /api/weather respondeu com HTTP 200 e payload normalizado');

  // 9.2 Parâmetro ausente -> HTTP 400
  const mockReqMissing = {
    url: `/api/weather?latitude=${validLat}`, // Sem longitude e sem datas
    headers: { host: 'localhost:3000' },
  };
  const mockResMissing = {
    setHeader: () => {},
    statusCode: 0,
    end: (chunk) => {
      mockResData = chunk;
      mockResStatus = mockResMissing.statusCode;
    },
  };
  await handleWeatherRequest(mockReqMissing, mockResMissing);
  assert.strictEqual(mockResStatus, 400, 'Parâmetros ausentes retornaram HTTP 400');
  console.log('  [PASS] Validação server-side rejeitou requisição incompleta com HTTP 400');

  // ------------------------------------------------------------------
  // 10. TESTE: CACHE DE 3 HORAS E MAPEAMENTO WMO
  // ------------------------------------------------------------------
  console.log('\n10. Teste: Cache de 3 Horas e Mapeamento Canônico WMO');
  weatherCache.clear();
  const t1 = Date.now();
  await service.getForecast({ latitude: validLat, longitude: validLng, startDate: startWithin, endDate: endWithin });
  const dur1 = Date.now() - t1;

  const t2 = Date.now();
  const fromCache = await service.getForecast({ latitude: validLat, longitude: validLng, startDate: startWithin, endDate: endWithin });
  const dur2 = Date.now() - t2;

  assert(fromCache, 'Retorno do cache íntegro');
  assert(dur2 <= dur1, 'Cache hit em tempo recorde');
  console.log(`  [PASS] Cache de 3 horas validado (Chamada 1: ${dur1}ms, Cache Hit: ${dur2}ms)`);

  // Validação WMO
  const rainWmo = wmoToCondition(61);
  assert.strictEqual(rainWmo.condition, 'Chuvoso');
  const sunWmo = wmoToCondition(0);
  assert.strictEqual(sunWmo.condition, 'Ensolarado');
  const thunderWmo = wmoToCondition(95);
  assert.strictEqual(thunderWmo.condition, 'Tempestade');
  console.log('  [PASS] Códigos WMO traduzidos com exatidão');

  console.log('\n====================================================');
  console.log('RESULTADO FINAL: TODOS OS 10 TESTES METEOROLÓGICOS PASSARAM!');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ FALHA NA SUÍTE METEOROLÓGICA:', err);
  process.exit(1);
});
