const routes = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/profile',
  '/availability',
  '/explore',
  '/trips',
  '/trips/trip_mvd_2026'
];

async function checkRoutes() {
  console.log('Validando requisições HTTP das 9 rotas no servidor local:');
  let allPass = true;
  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      const status = res.status;
      const text = await res.text();
      const hasRoot = text.includes('id="root"');
      const pass = status === 200 && hasRoot;
      console.log(`[${pass ? 'PASS' : 'FAIL'}] ${route} -> Status: ${status} (HTML entregue: ${hasRoot})`);
      if (!pass) allPass = false;
    } catch (err) {
      console.error(`[FAIL] ${route} -> Erro de conexão: ${err.message}`);
      allPass = false;
    }
  }

  if (allPass) {
    console.log('\n✅ TODAS AS 9 ROTAS RETORNARAM STATUS 200 OK COM HTML DA SPA VÁLIDO!');
    process.exit(0);
  } else {
    console.error('\n❌ Falha na validação de algumas rotas.');
    process.exit(1);
  }
}

checkRoutes();
