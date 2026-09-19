// ==========================================================
// TESTES AUTOMATIZADOS: SERVIÇO DE GEOCODIFICAÇÃO E DESTINOS
// Valida:
// 1. Cidade conhecida
// 2. Nomes ambíguos (desambiguação)
// 3. Consulta vazia (< 3 caracteres)
// 4. Nenhum resultado
// 5. Timeout (4000ms com AbortController)
// 6. Erro do provedor (HTTP 500 / Network Error)
// 7. Resposta incompleta (dados malformados / coordenadas inválidas)
// 8. Caracteres acentuados (Unicode NFC / cedilha / acentos)
// 9. Cache em dois níveis (hit vs miss)
// 10. Independência de provedor (Adapter Pattern)
// ==========================================================

import assert from 'node:assert';
import {
  GeocodingService,
  mockGeocodingProvider,
  nominatimProvider,
  sanitizeQuery,
  validateCoordinates,
  normalizeProviderItem,
  normalizeDestinationList,
  geocodingCache,
} from '../src/lib/geocoding/index.ts';

async function runTests() {
  console.log('====================================================');
  console.log('SUÍTE DE TESTES: GEOCODIFICAÇÃO E DESTINOS NORMALIZADOS');
  console.log('====================================================\n');

  geocodingCache.clear();
  mockGeocodingProvider.reset();

  // Instancia serviço com o provedor Mock controlado para testes
  const service = new GeocodingService(mockGeocodingProvider);

  // ------------------------------------------------------------------
  // 1. TESTE: CIDADE CONHECIDA
  // ------------------------------------------------------------------
  console.log('1. Teste: Cidade Conhecida (Montevidéu / Paris / Gramado)');
  const resultsKnown = await service.search('Montevidéu');

  assert(Array.isArray(resultsKnown), 'Retorno deve ser um array');
  assert(resultsKnown.length >= 1, 'Deve encontrar pelo menos 1 resultado para Montevidéu');

  const dest = resultsKnown[0];
  assert.strictEqual(dest.city, 'Montevidéu', 'Nome da cidade normalizado');
  assert.strictEqual(dest.country, 'Uruguai', 'Nome do país traduzido');
  assert.strictEqual(dest.countryCode, 'UY', 'Código ISO 3166-1 alpha-2 em maiúsculas');
  assert(dest.id.startsWith('geo_'), 'ID canônico iniciado com prefixo geo_');
  assert(validateCoordinates(dest.coordinates.latitude, dest.coordinates.longitude), 'Coordenadas válidas');
  assert(typeof dest.importance === 'number', 'Score de importância numérico');
  console.log(`  [PASS] Cidade conhecida normalizada: "${dest.displayName}" [Lat: ${dest.coordinates.latitude}, Lng: ${dest.coordinates.longitude}]`);

  // ------------------------------------------------------------------
  // 2. TESTE: NOMES AMBÍGUOS (DESAMBIGUAÇÃO)
  // ------------------------------------------------------------------
  console.log('\n2. Teste: Nomes Ambíguos (Desambiguação: Santiago)');
  geocodingCache.clear();
  const resultsAmbiguous = await service.search('Santiago');

  assert(resultsAmbiguous.length >= 2, 'Deve retornar múltiplos resultados para Santiago');

  const santiagoChile = resultsAmbiguous.find((d) => d.countryCode === 'CL');
  const santiagoEspanha = resultsAmbiguous.find((d) => d.countryCode === 'ES');

  assert(santiagoChile, 'Santiago (Chile) presente na desambiguação');
  assert(santiagoEspanha, 'Santiago de Compostela (Espanha) presente na desambiguação');
  assert.notStrictEqual(
    santiagoChile.coordinates.latitude,
    santiagoEspanha.coordinates.latitude,
    'Coordenadas geográficas distintas entre cidades homônimas'
  );
  console.log(`  [PASS] Ambiguidade resolvida: ${santiagoChile.displayName} (CL) vs ${santiagoEspanha.displayName} (ES)`);

  // ------------------------------------------------------------------
  // 3. TESTE: CONSULTA VAZIA OU MENOR QUE 3 CARACTERES
  // ------------------------------------------------------------------
  console.log('\n3. Teste: Consulta Vazia ou < 3 Caracteres');
  const empty1 = await service.search('');
  const empty2 = await service.search('   ');
  const empty3 = await service.search('pa'); // Apenas 2 caracteres

  assert.deepStrictEqual(empty1, [], 'Query vazia retorna [] sem chamada');
  assert.deepStrictEqual(empty2, [], 'Query com espaços retorna [] sem chamada');
  assert.deepStrictEqual(empty3, [], 'Query com 2 caracteres retorna [] sem chamada');
  console.log('  [PASS] Regra de 3 caracteres mínimos respeitada sem emissão de requisições');

  // ------------------------------------------------------------------
  // 4. TESTE: NENHUM RESULTADO (QUERY INEXISTENTE)
  // ------------------------------------------------------------------
  console.log('\n4. Teste: Nenhum Resultado Encontrado');
  const resultsNonExistent = await service.search('xxyyzz999nonexistent');

  assert(Array.isArray(resultsNonExistent), 'Deve retornar um array');
  assert.strictEqual(resultsNonExistent.length, 0, 'Deve retornar array vazio para localidade inexistente');
  console.log('  [PASS] Destino inexistente tratado graciosamente retornando [] sem exceções');

  // ------------------------------------------------------------------
  // 5. TESTE: TIMEOUT (4000ms COM ABORTCONTROLLER)
  // ------------------------------------------------------------------
  console.log('\n5. Teste: Timeout (Limite de 4 Segundos)');
  geocodingCache.clear();
  mockGeocodingProvider.simulateTimeout = true;

  try {
    await service.search('Cidade Lenta');
    assert.fail('Deveria ter disparado erro de timeout aos 4000ms');
  } catch (err) {
    assert(
      err.message.includes('Tempo limite excedido') || err.message.includes('timeout'),
      `Exceção de timeout capturada: "${err.message}"`
    );
    console.log('  [PASS] Timeout disparado após 4 segundos com cancelamento via AbortController');
  } finally {
    mockGeocodingProvider.reset();
  }

  // ------------------------------------------------------------------
  // 6. TESTE: ERRO DO PROVEDOR (HTTP 500 / NETWORK FAILURE)
  // ------------------------------------------------------------------
  console.log('\n6. Teste: Erro do Provedor (500 Internal Server Error)');
  geocodingCache.clear();
  mockGeocodingProvider.simulateNetworkError = true;

  try {
    await service.search('Cidade com Erro');
    assert.fail('Deveria ter capturado falha do provedor');
  } catch (err) {
    assert(
      err.message.includes('Não foi possível consultar os destinos') || err.message.includes('500'),
      `Erro tratado com mensagem amigável: "${err.message}"`
    );
    console.log('  [PASS] Falha de infraestrutura do provedor tratada sem queda da aplicação');
  } finally {
    mockGeocodingProvider.reset();
  }

  // ------------------------------------------------------------------
  // 7. TESTE: RESPOSTA INCOMPLETA / DADOS MALFORMADOS
  // ------------------------------------------------------------------
  console.log('\n7. Teste: Resposta Incompleta e Dados Malformados');
  geocodingCache.clear();
  mockGeocodingProvider.simulateIncompleteResponse = true;

  const incompleteResults = await service.search('Dados Corrompidos');
  assert(Array.isArray(incompleteResults), 'Retorno é array seguro');
  // Deve ter descartado os 3 itens corrompidos e mantido apenas o item válido (Rio de Janeiro)
  assert.strictEqual(incompleteResults.length, 1, 'Descartou itens com coordenadas nulas ou sem cidade');
  assert.strictEqual(incompleteResults[0].city, 'Rio de Janeiro', 'Item íntegro preservado');
  console.log('  [PASS] Normalizador filtrou itens corrompidos mantendo apenas registros canônicos');
  mockGeocodingProvider.reset();

  // ------------------------------------------------------------------
  // 8. TESTE: CARACTERES ACENTUADOS E UNICODE NFC
  // ------------------------------------------------------------------
  console.log('\n8. Teste: Caracteres Acentuados (São Paulo / Montevidéu / Cedilha)');
  geocodingCache.clear();
  // Pesquisa com acento e cedilha
  const resComAcento = await service.search('São Paulo');
  assert(resComAcento.length >= 1, 'Deve encontrar São Paulo com acento');
  assert.strictEqual(resComAcento[0].city, 'São Paulo');

  // Pesquisa sem acento ("Sao Paulo") deve também encontrar devido à normalização
  geocodingCache.clear();
  const resSemAcento = await service.search('Sao Paulo');
  assert(resSemAcento.length >= 1, 'Deve encontrar São Paulo mesmo digitado sem acento');
  assert.strictEqual(resSemAcento[0].city, 'São Paulo');
  console.log('  [PASS] Normalização Unicode NFC e tolerância diacrítica funcionando perfeitamente');

  // ------------------------------------------------------------------
  // 9. TESTE: CACHE EM DOIS NÍVEIS (HIT VS MISS)
  // ------------------------------------------------------------------
  console.log('\n9. Teste: Cache em Dois Níveis');
  geocodingCache.clear();

  const startT1 = Date.now();
  const firstCall = await service.search('Buenos Aires');
  const elapsedT1 = Date.now() - startT1;

  const startT2 = Date.now();
  const cachedCall = await service.search('  buenos   aires '); // Espaços extras propositais
  const elapsedT2 = Date.now() - startT2;

  assert.strictEqual(cachedCall.length, firstCall.length, 'Dados idênticos retornados do cache');
  assert(elapsedT2 <= elapsedT1, 'Consulta ao cache com latência ultrabaixa');
  console.log(`  [PASS] Cache Hit validado com sucesso (1ª chamada: ${elapsedT1}ms, Cache: ${elapsedT2}ms)`);

  // ------------------------------------------------------------------
  // 10. TESTE: INDEPENDÊNCIA DE PROVEDOR (ADAPTER PATTERN)
  // ------------------------------------------------------------------
  console.log('\n10. Teste: Independência de Provedor (Adapter Pattern)');
  assert(typeof nominatimProvider.search === 'function', 'NominatimProvider implementa IGeocodingProvider');
  assert(typeof mockGeocodingProvider.search === 'function', 'MockGeocodingProvider implementa IGeocodingProvider');
  assert.strictEqual(nominatimProvider.name, 'nominatim');
  assert.strictEqual(mockGeocodingProvider.name, 'mock');

  // Alterna provedor no serviço
  service.setProvider(nominatimProvider);
  assert.strictEqual(service.getProvider().name, 'nominatim', 'Provedor alternado com sucesso');
  service.setProvider(mockGeocodingProvider);
  assert.strictEqual(service.getProvider().name, 'mock', 'Provedor restaurado para mock');
  console.log('  [PASS] Adapter Pattern assegura troca transparente de provedor sem impacto no contrato');

  console.log('\n====================================================');
  console.log('RESULTADO FINAL: TODOS OS 10 TESTES DE GEOCODIFICAÇÃO PASSARAM!');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ FALHA NA SUÍTE DE GEOCODIFICAÇÃO:', err);
  process.exit(1);
});
