import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { mockStore, Trip, AvailabilityPeriod, UserProfile } from '../data/mockStore';
import { useDemoState } from '../context/DemoContext';
import { EmptyState, LoadingState, ErrorState } from '../components/common/FeedbackStates';
import {
  Sparkles,
  Calendar,
  MapPin,
  ArrowRight,
  Plus,
  CloudSun,
  Clock,
  Compass,
  CheckCircle2,
  ChevronRight,
  Umbrella,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { demoState } = useDemoState();

  const [user, setUser] = useState<UserProfile>(mockStore.getUser());
  const [trips, setTrips] = useState<Trip[]>(mockStore.getTrips());
  const [availabilities, setAvailabilities] = useState<AvailabilityPeriod[]>(mockStore.getAvailabilities());

  useEffect(() => {
    return mockStore.subscribe(() => {
      setUser(mockStore.getUser());
      setTrips(mockStore.getTrips());
      setAvailabilities(mockStore.getAvailabilities());
    });
  }, []);

  if (demoState === 'loading') {
    return <LoadingState message="Carregando seu painel de viagens..." />;
  }

  if (demoState === 'error') {
    return (
      <ErrorState
        title="Falha ao sincronizar dashboard"
        message="Não foi possível recuperar seus roteiros e preferências. Verifique sua conexão."
      />
    );
  }

  if (demoState === 'empty' || trips.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Olá, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500">Seu centro de controle de viagens inteligentes.</p>
        </div>

        <EmptyState
          icon={Compass}
          title="Nenhuma viagem planejada ainda"
          description="Você ainda não gerou nenhum roteiro. Escolha um destino e deixe a IA alinhar as atrações com o clima!"
          actionText="Criar Meu Primeiro Roteiro"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  const nextTrip = trips[0];
  const otherTrips = trips.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Header with Greeting & Quick CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Olá, {user.name.split(' ')[0]} 👋
            </h1>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200/50">
              {trips.length} {trips.length === 1 ? 'viagem ativa' : 'viagens ativas'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Base: {user.homeCity} • Preferências: {user.preferences.styles.join(', ')}
          </p>
        </div>

        <Link
          to="/explore"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-98 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Novo Roteiro Inteligente
        </Link>
      </div>

      {/* Featured Next Trip Card */}
      {nextTrip && (
        <section aria-labelledby="featured-trip-title" className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
          <img
            src={nextTrip.coverImage}
            alt={nextTrip.title}
            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />

          <div className="relative z-10 p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Próxima Viagem Confirmada
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {nextTrip.status === 'saved' ? 'Roteiro Salvo' : 'Rascunho'}
              </span>
            </div>

            <div className="space-y-2 max-w-2xl">
              <h2 id="featured-trip-title" className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {nextTrip.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  {nextTrip.destination}, {nextTrip.country}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {nextTrip.startDate} até {nextTrip.endDate} ({nextTrip.durationDays} dias)
                </span>
              </p>
            </div>

            {/* Weather highlight badge */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 max-w-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Previsão Integrada: ~{nextTrip.weatherSummary.avgTemp}°C</h4>
                  <p className="text-[11px] text-slate-300">{nextTrip.weatherSummary.mainCondition}</p>
                </div>
              </div>
              {nextTrip.weatherSummary.hasRainRisk && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <Umbrella className="w-3 h-3" /> IA Alerta Chuva
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Link
                to={`/trips/${nextTrip.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-md"
              >
                Abrir Roteiro Completo
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Grid: Other Trips & Folgas cadastrados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Viagens Recentes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              Outras Viagens Salvas
            </h3>
            <Link to="/trips" className="text-xs font-bold text-indigo-600 hover:underline">
              Ver todas ({trips.length})
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherTrips.length > 0 ? (
              otherTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="group cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all space-y-3"
                >
                  <div className="relative h-36 rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={trip.coverImage}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-sm">
                      {trip.durationDays} dias
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {trip.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{trip.destination}, {trip.country}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                Nenhuma outra viagem salva no momento.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Janelas de Folga & Atalhos */}
        <div className="space-y-6">
          {/* Quick Folgas Widget */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Próximas Folgas
              </h3>
              <Link to="/availability" className="text-xs font-semibold text-indigo-600 hover:underline">
                Gerenciar
              </Link>
            </div>

            <div className="space-y-2.5">
              {availabilities.map((av) => (
                <div
                  key={av.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{av.title}</h5>
                    <p className="text-[11px] text-slate-500">
                      {av.startDate} • {av.durationDays} dias livres
                    </p>
                  </div>
                  <Link
                    to={`/explore?startDate=${av.startDate}&endDate=${av.endDate}`}
                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                    title="Planejar nesta data"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>

            <Link
              to="/availability"
              className="w-full py-2 px-3 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/80 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Nova Folga
            </Link>
          </div>

          {/* Prompt / AI Tip Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-950/30 dark:to-sky-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3 h-3" />
              Dica da IA do SmartTrip
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Datas de 2 a 4 dias são perfeitas para viagens com ritmo moderado. Ao buscar seu destino, verificamos a previsão e organizamos as caminhadas nos dias de sol!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
