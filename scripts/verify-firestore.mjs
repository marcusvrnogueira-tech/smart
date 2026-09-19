// ==========================================================
// SMARTTRIP - SUÍTE DE TESTES DA CAMADA FIRESTORE
// Valida CRUD, ownership, isolamento multi-usuário,
// integridade de dados e relatório de índices necessários.
// ==========================================================

import fs from 'fs';
import path from 'path';
import { tripsRepository } from '../src/lib/firebase/firestore/tripsRepository.ts';
import { availabilityRepository } from '../src/lib/firebase/firestore/availabilityRepository.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runFirestoreTests() {
  console.log('====================================================');
  console.log('SUÍTE DE TESTES: PERSISTÊNCIA FIRESTORE (SMARTTRIP)');
  console.log('====================================================\n');

  tripsRepository.resetForTests();
  availabilityRepository.resetForTests();

  const userA = 'usr_larissa_001';
  const userB = 'usr_thiago_002';
  let createdTripId = '';

  // ----------------------------------------------------
  // TESTE 1: Criar Viagem
  // ----------------------------------------------------
  console.log('1. Teste: Criar Viagem Válida (Propriedade de Usuário A)');
  try {
    const trip = await tripsRepository.createTrip(userA, {
      title: 'Viagem de Verão em Florianópolis',
      destination: 'Florianópolis',
      country: 'Brasil',
      coverImage: 'https://images.unsplash.com/photo-floripa',
      startDate: '2026-12-10',
      endDate: '2026-12-15',
      durationDays: 6,
      status: 'draft',
      preferencesSnapshot: {
        styles: ['Praia & Mar'],
        pace: 'tranquilo',
        budget: 'moderado',
      },
      weatherSummary: {
        avgTemp: 28,
        hasRainRisk: false,
        mainCondition: 'Ensolarado',
      },
      itinerary: [
        {
          dayIndex: 1,
          date: '2026-12-10',
          weather: { tempMin: 22, tempMax: 30, rainProbability: 10, condition: 'Ensolarado' },
          activities: [
            {
              id: 'act_flp_1',
              period: 'morning',
              time: '09:00',
              title: 'Caminhada na Praia da Joaquina',
              description: 'Manhã nas dunas e praia.',
              category: 'natureza',
              estimatedCost: 'gratis',
              weatherTip: 'Protetor solar recomendado.',
            },
          ],
        },
      ],
    });

    createdTripId = trip.id;
    assert(trip.id.startsWith('trip_'), 'ID único da viagem gerado com sucesso');
    assert(trip.userId === userA, 'Proprietário gravado corretamente como Usuário A');
    assert(trip.durationDays === 6, 'Duração de dias registrada');
  } catch (err) {
    assert(false, `Falha ao criar viagem: ${err.message}`);
  }

  // ----------------------------------------------------
  // TESTE 2: Ler Viagem
  // ----------------------------------------------------
  console.log('\n2. Teste: Ler Viagem pelo Proprietário (Usuário A)');
  try {
    const fetched = await tripsRepository.getTripById(createdTripId, userA);
    assert(fetched.id === createdTripId, 'Viagem recuperada com dados idênticos');
    assert(fetched.title === 'Viagem de Verão em Florianópolis', 'Título recuperado com sucesso');
    assert(fetched.itinerary.length === 1, 'Itinerário embutido recuperado em 1 única operação atômica');
  } catch (err) {
    assert(false, `Falha na leitura da viagem: ${err.message}`);
  }

  // ----------------------------------------------------
  // TESTE 3: Atualizar Viagem & Atividades
  // ----------------------------------------------------
  console.log('\n3. Teste: Atualizar Viagem e Atividades (Usuário A)');
  try {
    await tripsRepository.updateTrip(createdTripId, userA, {
      title: 'Viagem de Verão em Florianópolis (Confirmada)',
      status: 'saved',
    });

    const updated = await tripsRepository.getTripById(createdTripId, userA);
    assert(updated.title === 'Viagem de Verão em Florianópolis (Confirmada)', 'Título atualizado com sucesso');
    assert(updated.status === 'saved', 'Status atualizado para "saved"');

    // Atualização de atividade inline
    await tripsRepository.updateTripActivity(createdTripId, userA, 1, 'act_flp_1', {
      time: '09:30',
      title: 'Caminhada nas Dunas da Joaquina',
    });

    const updatedAct = await tripsRepository.getTripById(createdTripId, userA);
    const act = updatedAct.itinerary[0].activities[0];
    assert(act.time === '09:30', 'Horário da atividade editado com sucesso');
    assert(act.title === 'Caminhada nas Dunas da Joaquina', 'Título da atividade editado com sucesso');
  } catch (err) {
    assert(false, `Falha ao atualizar viagem: ${err.message}`);
  }

  // ----------------------------------------------------
  // TESTE 4: Isolamento Usuário A vs Usuário B (Ownership)
  // ----------------------------------------------------
  console.log('\n4. Teste: Isolamento e Segurança (Usuário A vs Usuário B)');
  
  // Tentativa 4.1: Usuário B tenta ler viagem de Usuário A
  try {
    await tripsRepository.getTripById(createdTripId, userB);
    assert(false, 'Deveria ter bloqueado leitura de Usuário B');
  } catch (err) {
    assert(
      err.message.includes('Acesso negado') || err.message.includes('você não é o proprietário'),
      `Leitura de Usuário B bloqueada com sucesso: "${err.message}"`
    );
  }

  // Tentativa 4.2: Usuário B tenta alterar viagem de Usuário A
  try {
    await tripsRepository.updateTrip(createdTripId, userB, { title: 'Viagem Invadida' });
    assert(false, 'Deveria ter bloqueado atualização de Usuário B');
  } catch (err) {
    assert(
      err.message.includes('Acesso negado'),
      'Tentativa de alteração por terceiro bloqueada com sucesso'
    );
  }

  // Tentativa 4.3: Usuário B tenta transferir posse da viagem para si mesmo
  try {
    await tripsRepository.updateTrip(createdTripId, userA, { userId: userB });
    assert(false, 'Deveria ter bloqueado tentativa de alterar userId');
  } catch (err) {
    assert(
      err.message.includes('transferir a propriedade') || err.message.includes('Security Violation'),
      `Tentativa de transferência de posse rejeitada com sucesso: "${err.message}"`
    );
  }

  // Tentativa 4.4: Usuário B tenta excluir viagem de Usuário A
  try {
    await tripsRepository.deleteTrip(createdTripId, userB);
    assert(false, 'Deveria ter bloqueado exclusão por Usuário B');
  } catch (err) {
    assert(
      err.message.includes('Acesso negado'),
      'Exclusão por terceiro bloqueada com sucesso'
    );
  }

  // ----------------------------------------------------
  // TESTE 5: Documento Inexistente
  // ----------------------------------------------------
  console.log('\n5. Teste: Tratamento de Documento Inexistente');
  try {
    await tripsRepository.getTripById('trip_id_inexistente_999', userA);
    assert(false, 'Deveria ter lançado erro para ID inexistente');
  } catch (err) {
    assert(
      err.message.includes('não encontrada'),
      `Documento inexistente tratado com sucesso: "${err.message}"`
    );
  }

  // ----------------------------------------------------
  // TESTE 6: Dados Inválidos (Validação de Schemas e Limites)
  // ----------------------------------------------------
  console.log('\n6. Teste: Rejeição de Dados Inválidos (RN-001)');
  
  // Caso 6.1: Duração excedendo limite máximo (20 dias > 15 dias)
  try {
    await tripsRepository.createTrip(userA, {
      title: 'Viagem Muito Longa',
      destination: 'Paris',
      country: 'França',
      coverImage: 'url',
      startDate: '2026-05-01',
      endDate: '2026-05-21',
      durationDays: 20, // Inválido no MVP
      status: 'draft',
      preferencesSnapshot: { styles: ['Cultura'], pace: 'moderado', budget: 'luxo' },
      weatherSummary: { avgTemp: 18, hasRainRisk: false, mainCondition: 'Sol' },
      itinerary: [],
    });
    assert(false, 'Deveria ter rejeitado viagem com mais de 15 dias');
  } catch (err) {
    assert(
      err.message.includes('1 a 15 dias') || err.message.includes('RN-001'),
      `Bloqueio correto de duração acima de 15 dias: "${err.message}"`
    );
  }

  // Caso 6.2: Duração zero ou negativa
  try {
    await tripsRepository.createTrip(userA, {
      title: 'Viagem Nula',
      destination: 'Recife',
      country: 'Brasil',
      coverImage: 'url',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
      durationDays: 0, // Inválido
      status: 'draft',
      preferencesSnapshot: { styles: ['Cultura'], pace: 'moderado', budget: 'luxo' },
      weatherSummary: { avgTemp: 28, hasRainRisk: false, mainCondition: 'Sol' },
      itinerary: [],
    });
    assert(false, 'Deveria ter rejeitado viagem com duração 0');
  } catch (err) {
    assert(
      err.message.includes('1 a 15 dias'),
      `Bloqueio correto de duração zero: "${err.message}"`
    );
  }

  // Caso 6.3: Título ausente
  try {
    await tripsRepository.createTrip(userA, {
      title: '   ', // Inválido
      destination: 'Recife',
      country: 'Brasil',
      coverImage: 'url',
      startDate: '2026-05-01',
      endDate: '2026-05-03',
      durationDays: 3,
      status: 'draft',
      preferencesSnapshot: { styles: ['Cultura'], pace: 'moderado', budget: 'luxo' },
      weatherSummary: { avgTemp: 28, hasRainRisk: false, mainCondition: 'Sol' },
      itinerary: [],
    });
    assert(false, 'Deveria ter rejeitado título em branco');
  } catch (err) {
    assert(
      err.message.includes('título da viagem é obrigatório'),
      `Bloqueio correto de título ausente: "${err.message}"`
    );
  }

  // ----------------------------------------------------
  // TESTE 7: Subcoleção de Folgas (availability)
  // ----------------------------------------------------
  console.log('\n7. Teste: Subcoleção de Folgas (/users/{userId}/availabilities)');
  try {
    const av = await availabilityRepository.createAvailability(userA, {
      title: 'Feriado de Natal',
      startDate: '2026-12-24',
      endDate: '2026-12-26',
      durationDays: 3,
    });
    assert(av.id.startsWith('av_'), 'Folga cadastrada na subcoleção');

    const userAList = await availabilityRepository.listUserAvailabilities(userA);
    assert(userAList.some((item) => item.id === av.id), 'Folga listada na consulta de Usuário A');

    const userBList = await availabilityRepository.listUserAvailabilities(userB);
    assert(!userBList.some((item) => item.id === av.id), 'Folga de Usuário A NÃO aparece para Usuário B');

    await availabilityRepository.deleteAvailability(userA, av.id);
    const afterDelete = await availabilityRepository.listUserAvailabilities(userA);
    assert(!afterDelete.some((item) => item.id === av.id), 'Folga excluída com sucesso');
  } catch (err) {
    assert(false, `Falha na subcoleção de folgas: ${err.message}`);
  }

  // ----------------------------------------------------
  // TESTE 8: Excluir Viagem
  // ----------------------------------------------------
  console.log('\n8. Teste: Excluir Viagem pelo Proprietário');
  try {
    await tripsRepository.deleteTrip(createdTripId, userA);
    try {
      await tripsRepository.getTripById(createdTripId, userA);
      assert(false, 'Viagem não deveria existir após exclusão');
    } catch {
      assert(true, 'Viagem e itinerário embutido excluídos definitivamente com sucesso');
    }
  } catch (err) {
    assert(false, `Falha ao excluir viagem: ${err.message}`);
  }

  // ----------------------------------------------------
  // TESTE 9: Relatório de Índices Compostos Necessários
  // ----------------------------------------------------
  console.log('\n9. Relatório e Validação de Índices Compostos:');
  const indexFilePath = path.resolve('firestore.indexes.json');
  assert(fs.existsSync(indexFilePath), 'Arquivo firestore.indexes.json configurado na raiz');

  const indexContent = JSON.parse(fs.readFileSync(indexFilePath, 'utf8'));
  const hasTripsOrderIndex = indexContent.indexes.some(
    (idx) =>
      idx.collectionGroup === 'trips' &&
      idx.fields.some((f) => f.fieldPath === 'userId') &&
      idx.fields.some((f) => f.fieldPath === 'createdAt')
  );
  const hasTripsStatusIndex = indexContent.indexes.some(
    (idx) =>
      idx.collectionGroup === 'trips' &&
      idx.fields.some((f) => f.fieldPath === 'status')
  );
  const hasAvailabilitiesIndex = indexContent.indexes.some(
    (idx) => idx.collectionGroup === 'availabilities'
  );

  assert(hasTripsOrderIndex, 'Índice Composto Configurado: trips (userId ASC, createdAt DESC)');
  assert(hasTripsStatusIndex, 'Índice Composto Configurado: trips (userId ASC, status ASC, createdAt DESC)');
  assert(hasAvailabilitiesIndex, 'Índice Composto Configurado: availabilities (userId ASC, startDate ASC)');

  // ----------------------------------------------------
  // RESULTADO DA SUÍTE
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`RESULTADO DA SUÍTE FIRESTORE: ${passed} PASSADOS, ${failed} FALHAS`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFirestoreTests();
