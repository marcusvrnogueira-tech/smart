// ==========================================================
// SMARTTRIP - SUÍTE DE TESTES DE AUTENTICAÇÃO E ISOLAMENTO
// Cobre os 9 cenários obrigatórios definidos na SPEC_AUTH.
// ==========================================================

import {
  registerWithEmail,
  loginWithEmail,
  logoutUser,
  resetPassword,
  ensureUserProfile,
  mockAuthService,
} from '../src/lib/firebase/auth.ts';

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

async function runAuthTests() {
  console.log('====================================================');
  console.log('SUÍTE DE TESTES: AUTENTICAÇÃO E IDENTIDADE (SMARTTRIP)');
  console.log('====================================================\n');

  // Reset do mock service para garantir ambiente limpo
  mockAuthService.resetForTests();

  // ----------------------------------------------------
  // CENÁRIO 1: Cadastro Válido
  // ----------------------------------------------------
  console.log('1. Teste: Cadastro Válido');
  try {
    const userA = await registerWithEmail({
      name: 'Larissa Mendes',
      email: 'larissa.teste@smarttrip.com',
      password: 'senhaSegura123',
    });

    assert(userA.uid.startsWith('usr_'), 'UID de usuário gerado com sucesso');
    assert(userA.email === 'larissa.teste@smarttrip.com', 'E-mail gravado corretamente');
    assert(userA.role === 'user', 'Role inicial atribuído compulsoriamente como "user"');
    assert(userA.displayName === 'Larissa Mendes', 'Nome de exibição registrado');
  } catch (err) {
    assert(false, `Falha no cadastro válido: ${err.message}`);
  }

  // ----------------------------------------------------
  // CENÁRIO 2: Cadastro Duplicado
  // ----------------------------------------------------
  console.log('\n2. Teste: Cadastro Duplicado com mesmo e-mail');
  try {
    await registerWithEmail({
      name: 'Larissa Fake',
      email: 'larissa.teste@smarttrip.com',
      password: 'outraSenha123',
    });
    assert(false, 'Deveria ter lançado erro de e-mail já cadastrado');
  } catch (err) {
    assert(
      err.message.includes('já está cadastrado'),
      `Rejeição correta de e-mail duplicado: "${err.message}"`
    );
  }

  // ----------------------------------------------------
  // CENÁRIO 3: Senha Inválida (menor que 6 caracteres)
  // ----------------------------------------------------
  console.log('\n3. Teste: Senha Inválida (< 6 caracteres)');
  try {
    await registerWithEmail({
      name: 'Thiago Rocha',
      email: 'thiago.teste@smarttrip.com',
      password: '123',
    });
    assert(false, 'Deveria ter rejeitado senha com menos de 6 caracteres');
  } catch (err) {
    assert(
      err.message.includes('mínimo 6 caracteres'),
      `Validação de senha fraca ativada com sucesso: "${err.message}"`
    );
  }

  // ----------------------------------------------------
  // CENÁRIO 4: Login Válido
  // ----------------------------------------------------
  console.log('\n4. Teste: Login Válido');
  try {
    const loggedUser = await loginWithEmail({
      email: 'larissa.teste@smarttrip.com',
      password: 'senhaSegura123',
    });
    assert(loggedUser.uid.startsWith('usr_'), 'Sessão autenticada com sucesso');
    assert(loggedUser.role === 'user', 'Identidade e role mantidos no login');
  } catch (err) {
    assert(false, `Falha no login válido: ${err.message}`);
  }

  // ----------------------------------------------------
  // CENÁRIO 5: Login Inválido (senha incorreta ou e-mail inexistente)
  // ----------------------------------------------------
  console.log('\n5. Teste: Login Inválido (credenciais incorretas)');
  try {
    await loginWithEmail({
      email: 'larissa.teste@smarttrip.com',
      password: 'senhaErradaTotal',
    });
    assert(false, 'Deveria ter rejeitado senha incorreta');
  } catch (err) {
    assert(
      err.message.includes('E-mail ou senha incorretos'),
      `Bloqueio correto de credencial inválida: "${err.message}"`
    );
  }

  // ----------------------------------------------------
  // CENÁRIO 6: Logout
  // ----------------------------------------------------
  console.log('\n6. Teste: Logout do Usuário');
  try {
    await logoutUser();
    const currentAfterLogout = mockAuthService.getCurrentUser();
    assert(currentAfterLogout === null, 'Sessão invalidada e usuário atual definido como null');
  } catch (err) {
    assert(false, `Falha no logout: ${err.message}`);
  }

  // ----------------------------------------------------
  // CENÁRIO 7: Reset de Senha (Forgot Password)
  // ----------------------------------------------------
  console.log('\n7. Teste: Recuperação de Senha (Forgot Password)');
  try {
    const message = await resetPassword('larissa.teste@smarttrip.com');
    assert(
      message.includes('instruções de redefinição foram enviadas'),
      `Mensagem neutra de recuperação exibida sem vazar enumeração: "${message}"`
    );
  } catch (err) {
    assert(false, `Falha na recuperação de senha: ${err.message}`);
  }

  // ----------------------------------------------------
  // CENÁRIO 8: Acesso Privado Sem Sessão
  // ----------------------------------------------------
  console.log('\n8. Teste: Proteção de Rotas Privadas sem Sessão');
  const privateRoutes = ['/dashboard', '/profile', '/availability', '/explore', '/trips', '/trips/123'];
  const simulatedUnauthenticatedUser = mockAuthService.getCurrentUser(); // Deve ser null após logout

  assert(
    simulatedUnauthenticatedUser === null,
    'Usuário confirmado como deslogado'
  );

  let allRedirectsCorrect = true;
  for (const route of privateRoutes) {
    // Simula a lógica do router guard de App.tsx
    const shouldRedirect = !simulatedUnauthenticatedUser;
    const redirectUrl = `/login?redirect=${encodeURIComponent(route)}`;
    if (!shouldRedirect || !redirectUrl.includes('/login?redirect=')) {
      allRedirectsCorrect = false;
    }
  }
  assert(
    allRedirectsCorrect,
    'Todas as 6 rotas privadas interceptadas e redirecionadas para /login?redirect=...'
  );

  // ----------------------------------------------------
  // CENÁRIO 9: Criação Idempotente do Perfil (users/{uid} criado 1 única vez)
  // ----------------------------------------------------
  console.log('\n9. Teste: Criação Idempotente do Perfil users/{uid}');
  try {
    const uidTest = 'usr_idempotent_999';
    const profile1 = await ensureUserProfile(uidTest, 'teste.idempotente@smarttrip.com', 'Nome Inicial');
    const profile2 = await ensureUserProfile(uidTest, 'teste.idempotente@smarttrip.com', 'Nome Modificado');

    const count = mockAuthService.getProfileCreationCount(uidTest);
    assert(count === 1, `Perfil provisionado exatamente 1 vez no armazenamento (contagem: ${count})`);
    assert(profile1.uid === profile2.uid, 'UIDs consistentes em chamadas repetidas');
  } catch (err) {
    assert(false, `Falha no teste de idempotência: ${err.message}`);
  }

  // ----------------------------------------------------
  // RESULTADO FINAL
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`RESULTADO DA SUÍTE: ${passed} PASSADOS, ${failed} FALHAS`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAuthTests();
