import React, { useEffect } from 'react';
import { RouterProvider, useRouter } from './router/RouterContext';
import { DemoProvider } from './context/DemoContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DemoStateToggle } from './components/common/DemoStateToggle';

// 9 Telas da SPEC de Telas
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { ExplorePage } from './pages/ExplorePage';
import { TripsPage } from './pages/TripsPage';
import { TripDetailsPage } from './pages/TripDetailsPage';
import { EmptyState, LoadingState } from './components/common/FeedbackStates';

const PRIVATE_ROUTES = [
  '/dashboard',
  '/profile',
  '/availability',
  '/explore',
  '/trips',
  '/trips/[id]',
];

const AUTH_ONLY_ROUTES = ['/login', '/register'];

function AppRoutes() {
  const { match, currentPath, navigate } = useRouter();
  const { user, isLoading } = useAuth();

  const isPrivateRoute = PRIVATE_ROUTES.includes(match.path);
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.includes(match.path);

  // Redirecionamentos de proteção de rotas
  useEffect(() => {
    if (isLoading) return;

    if (isPrivateRoute && !user) {
      // Usuário não autenticado tentando acessar rota privada
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else if (isAuthOnlyRoute && user) {
      // Usuário já autenticado tentando acessar login/register
      navigate('/dashboard');
    }
  }, [user, isLoading, match.path, currentPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingState message="Verificando credenciais de acesso..." />
      </div>
    );
  }

  const renderCurrentPage = () => {
    // Se rota privada e deslogado, exibe estado bloqueado antes do redirecionamento
    if (isPrivateRoute && !user) {
      return (
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <EmptyState
            title="Acesso Restrito"
            description="Você precisa estar autenticado para acessar este recurso."
            actionText="Fazer Login"
            onAction={() => navigate(`/login?redirect=${encodeURIComponent(currentPath)}`)}
          />
        </div>
      );
    }

    switch (match.path) {
      case '/':
        return <HomePage />;
      case '/login':
        return <LoginPage />;
      case '/register':
        return <RegisterPage />;
      case '/dashboard':
        return <DashboardPage />;
      case '/profile':
        return <ProfilePage />;
      case '/availability':
        return <AvailabilityPage />;
      case '/explore':
        return <ExplorePage />;
      case '/trips':
        return <TripsPage />;
      case '/trips/[id]':
        return <TripDetailsPage />;
      default:
        return (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <EmptyState
              title="Página não encontrada (404)"
              description={`A rota "${match.path}" não foi encontrada no SmartTrip.`}
              actionText="Ir para o Dashboard"
              onAction={() => navigate('/dashboard')}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area with bottom padding for mobile nav */}
      <main className="flex-1 pb-20 md:pb-8">
        {renderCurrentPage()}
      </main>

      {/* Mobile Bottom Navigation */}
      {user && <BottomNav />}

      {/* Demo Floating Controls (Allows toggling Normal, Empty, Loading, Error) */}
      <DemoStateToggle />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <DemoProvider>
          <AppRoutes />
        </DemoProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
